import UIKit
import NitroModules

/**
 * HybridRnBottomSheet
 *
 * Native iOS implementation of the bottom sheet using UISheetPresentationController.
 * This class conforms to the generated HybridRnBottomSheetSpec protocol from Nitrogen.
 *
 * Key responsibilities:
 * - Present/dismiss native iOS sheets with React Native content
 * - Map detent configurations to UISheetPresentationController.Detent
 * - Handle lifecycle callbacks and state changes
 * - Bridge interaction events back to JavaScript
 */
class HybridRnBottomSheet: HybridRnBottomSheetSpec, RecyclableView {
    private enum PendingPropUpdate: Hashable {
        case detents
        case selectedDetent
        case openState
        case grabberVisible
        case allowSwipeToDismiss
        case backgroundInteraction
        case cornerRadius
        case expandsWhenScrolledToEdge
        case preferredColorScheme
        case contentBackgroundStyle
        case contentBackgroundBlurStyle
    }

    // =========================================================================
    // MARK: - UIView (required by HybridViewSpec)
    // =========================================================================

    let view: SheetHostContainerView
    private let contentContainer = SheetContentContainerView()

    // =========================================================================
    // MARK: - Sheet State
    // =========================================================================

    /// Current presentation state
    private var isCurrentlyPresented: Bool = false

    /// Whether the host view is currently attached to a window hierarchy.
    private var isHostAttached: Bool = false

    /// Tracks pending presentation requests while host view is detached.
    private var shouldPresentWhenHostAttaches: Bool = false

    /// Current detent index
    private var currentDetentIndex: Int = 0

    /// Sheet presenter view controller (lazy initialized)
    private var sheetViewController: SheetPresenterViewController?

    /// Delegate proxy required because UISheetPresentationControllerDelegate is NSObject-based
    private lazy var sheetPresentationDelegate = SheetPresentationDelegateProxy(owner: self)

    /// Suppress one delegate callback after programmatic detent changes to avoid duplicate events
    private var suppressNextDetentDelegateEvent: Bool = false

    /// Nitro prop updates are wrapped in before/after hooks; stage updates to apply once per batch.
    private var isBatchUpdatingProps: Bool = false
    private var pendingPropUpdates: Set<PendingPropUpdate> = []
    private var appliedIsOpenState: Bool = false

    override init() {
        self.view = SheetHostContainerView()
        super.init()
        self.view.lifecycleOwner = self
    }

    // =========================================================================
    // MARK: - Props (conforming to HybridRnBottomSheetSpec)
    // =========================================================================

    /// Detent configurations
    private var detentsStorage: [NativeDetentConfig] = []
    var detents: [NativeDetentConfig] {
        get {
            runOnMainSync {
                detentsStorage
            }
        }
        set {
            runOnMainSync {
                detentsStorage = newValue
                queuePropUpdate(.detents)
            }
        }
    }

    /// Initial detent index when sheet opens
    private var initialDetentIndexStorage: Double = 0
    var initialDetentIndex: Double {
        get {
            runOnMainSync {
                initialDetentIndexStorage
            }
        }
        set {
            runOnMainSync {
                initialDetentIndexStorage = newValue
            }
        }
    }

    /// Selected detent index (-1 for uncontrolled)
    private var selectedDetentIndexStorage: Double = -1
    var selectedDetentIndex: Double {
        get {
            runOnMainSync {
                selectedDetentIndexStorage
            }
        }
        set {
            runOnMainSync {
                selectedDetentIndexStorage = newValue
                queuePropUpdate(.selectedDetent)
            }
        }
    }

    /// Whether sheet should be open
    private var isOpenStorage: Bool = false
    var isOpen: Bool {
        get {
            runOnMainSync {
                isOpenStorage
            }
        }
        set {
            runOnMainSync {
                isOpenStorage = newValue
                queuePropUpdate(.openState)
            }
        }
    }

    /// Show grabber handle
    private var grabberVisibleStorage: Bool = true
    var grabberVisible: Bool {
        get {
            runOnMainSync {
                grabberVisibleStorage
            }
        }
        set {
            runOnMainSync {
                grabberVisibleStorage = newValue
                queuePropUpdate(.grabberVisible)
            }
        }
    }

    /// Allow swipe to dismiss
    private var allowSwipeToDismissStorage: Bool = true
    var allowSwipeToDismiss: Bool {
        get {
            runOnMainSync {
                allowSwipeToDismissStorage
            }
        }
        set {
            runOnMainSync {
                allowSwipeToDismissStorage = newValue
                queuePropUpdate(.allowSwipeToDismiss)
            }
        }
    }

    /// Background interaction mode
    private var backgroundInteractionStorage: NativeBackgroundInteraction = .first("modal")
    var backgroundInteraction: NativeBackgroundInteraction {
        get {
            runOnMainSync {
                backgroundInteractionStorage
            }
        }
        set {
            runOnMainSync {
                backgroundInteractionStorage = newValue
                queuePropUpdate(.backgroundInteraction)
            }
        }
    }

    /// Corner radius (-1 for system default)
    private var cornerRadiusStorage: Double = -1
    var cornerRadius: Double {
        get {
            runOnMainSync {
                cornerRadiusStorage
            }
        }
        set {
            runOnMainSync {
                cornerRadiusStorage = newValue
                queuePropUpdate(.cornerRadius)
            }
        }
    }

    /// Expand when scrolled to edge
    private var expandsWhenScrolledToEdgeStorage: Bool = true
    var expandsWhenScrolledToEdge: Bool {
        get {
            runOnMainSync {
                expandsWhenScrolledToEdgeStorage
            }
        }
        set {
            runOnMainSync {
                expandsWhenScrolledToEdgeStorage = newValue
                queuePropUpdate(.expandsWhenScrolledToEdge)
            }
        }
    }

    /// Preferred color scheme override for sheet content.
    private var preferredColorSchemeStorage: String = "system"
    var preferredColorScheme: String {
        get {
            runOnMainSync {
                preferredColorSchemeStorage
            }
        }
        set {
            runOnMainSync {
                preferredColorSchemeStorage = newValue
                queuePropUpdate(.preferredColorScheme)
            }
        }
    }

    /// Background style for sheet content.
    private var contentBackgroundStyleStorage: String = "system"
    var contentBackgroundStyle: String {
        get {
            runOnMainSync {
                contentBackgroundStyleStorage
            }
        }
        set {
            runOnMainSync {
                contentBackgroundStyleStorage = newValue
                queuePropUpdate(.contentBackgroundStyle)
            }
        }
    }

    /// Blur style used when background style is set to blur.
    private var contentBackgroundBlurStyleStorage: String = "regular"
    var contentBackgroundBlurStyle: String {
        get {
            runOnMainSync {
                contentBackgroundBlurStyleStorage
            }
        }
        set {
            runOnMainSync {
                contentBackgroundBlurStyleStorage = newValue
                queuePropUpdate(.contentBackgroundBlurStyle)
            }
        }
    }

    // =========================================================================
    // MARK: - Callbacks (conforming to HybridRnBottomSheetSpec)
    // =========================================================================

    private var onOpenChangeStorage: (_ isOpen: Bool, _ reason: NativeChangeReason) -> Void = { _, _ in }
    var onOpenChange: (_ isOpen: Bool, _ reason: NativeChangeReason) -> Void {
        get {
            runOnMainSync {
                onOpenChangeStorage
            }
        }
        set {
            runOnMainSync {
                onOpenChangeStorage = newValue
            }
        }
    }

    private var onDetentChangeStorage: (_ index: Double, _ reason: NativeChangeReason) -> Void = { _, _ in }
    var onDetentChange: (_ index: Double, _ reason: NativeChangeReason) -> Void {
        get {
            runOnMainSync {
                onDetentChangeStorage
            }
        }
        set {
            runOnMainSync {
                onDetentChangeStorage = newValue
            }
        }
    }

    private var onWillPresentStorage: () -> Void = {}
    var onWillPresent: () -> Void {
        get {
            runOnMainSync {
                onWillPresentStorage
            }
        }
        set {
            runOnMainSync {
                onWillPresentStorage = newValue
            }
        }
    }

    private var onDidPresentStorage: () -> Void = {}
    var onDidPresent: () -> Void {
        get {
            runOnMainSync {
                onDidPresentStorage
            }
        }
        set {
            runOnMainSync {
                onDidPresentStorage = newValue
            }
        }
    }

    private var onWillDismissStorage: () -> Void = {}
    var onWillDismiss: () -> Void {
        get {
            runOnMainSync {
                onWillDismissStorage
            }
        }
        set {
            runOnMainSync {
                onWillDismissStorage = newValue
            }
        }
    }

    private var onDidDismissStorage: () -> Void = {}
    var onDidDismiss: () -> Void {
        get {
            runOnMainSync {
                onDidDismissStorage
            }
        }
        set {
            runOnMainSync {
                onDidDismissStorage = newValue
            }
        }
    }

    // =========================================================================
    // MARK: - Methods (conforming to HybridRnBottomSheetSpec)
    // =========================================================================

    func present() throws {
        runOnMainSync {
            guard !hasActivePresentationSession else { return }
            shouldPresentWhenHostAttaches = true
            presentSheet()
        }
    }

    func dismiss() throws {
        runOnMainSync {
            shouldPresentWhenHostAttaches = false
            SingleActiveSheetSessionCoordinator.shared.cancelPendingPresentation(for: self)
            guard hasActivePresentationSession else { return }
            dismissSheet(reason: .programmatic)
        }
    }

    func snapToDetent(index: Double) throws {
        runOnMainSync {
            snapToDetentInternal(Int(index), animated: true)
        }
    }

    func getCurrentDetentIndex() throws -> Double {
        runOnMainSync {
            Double(currentDetentIndex)
        }
    }

    func beforeUpdate() {
        runOnMainSync {
            isBatchUpdatingProps = true
        }
    }

    func afterUpdate() {
        runOnMainSync {
            guard isBatchUpdatingProps else { return }
            isBatchUpdatingProps = false

            let updates = pendingPropUpdates
            pendingPropUpdates.removeAll()
            applyQueuedPropUpdates(updates)
        }
    }

    // =========================================================================
    // MARK: - Private Implementation
    // =========================================================================

    private func handleOpenStateChange(oldValue: Bool) {
        if isOpenStorage && !oldValue {
            shouldPresentWhenHostAttaches = true
            presentSheet()
        } else if !isOpenStorage && oldValue {
            shouldPresentWhenHostAttaches = false
            dismissSheet(reason: .programmatic)
        }
    }

    private func queuePropUpdate(_ update: PendingPropUpdate) {
        precondition(Thread.isMainThread, "Prop updates must be queued on main thread")
        if isBatchUpdatingProps {
            pendingPropUpdates.insert(update)
            return
        }
        applyQueuedPropUpdates([update])
    }

    private func applyQueuedPropUpdates(_ updates: Set<PendingPropUpdate>) {
        precondition(Thread.isMainThread, "Queued prop updates must be applied on main thread")
        guard !updates.isEmpty else { return }

        if updates.contains(.detents) {
            updateDetentsIfPresented()
        }
        if updates.contains(.grabberVisible) {
            updateGrabberVisibility()
        }
        if updates.contains(.allowSwipeToDismiss) {
            updateSwipeToDismiss()
        }
        if updates.contains(.backgroundInteraction) {
            updateBackgroundInteraction()
        }
        if updates.contains(.cornerRadius) {
            updateCornerRadius()
        }
        if updates.contains(.expandsWhenScrolledToEdge) {
            updateExpandsWhenScrolledToEdge()
        }
        if updates.contains(.preferredColorScheme) {
            updatePreferredColorScheme()
        }
        if updates.contains(.contentBackgroundStyle) || updates.contains(.contentBackgroundBlurStyle) {
            updateContentBackgroundStyle()
        }
        if updates.contains(.selectedDetent), selectedDetentIndexStorage >= 0 {
            snapToDetentInternal(Int(selectedDetentIndexStorage), animated: true)
        }
        if updates.contains(.openState), isOpenStorage != appliedIsOpenState {
            let previousOpenState = appliedIsOpenState
            appliedIsOpenState = isOpenStorage
            handleOpenStateChange(oldValue: previousOpenState)
        }
    }

    private func runOnMainSync<T>(_ work: () -> T) -> T {
        if Thread.isMainThread {
            return work()
        }

        var result: T?
        DispatchQueue.main.sync {
            result = work()
        }
        guard let unwrappedResult = result else {
            fatalError("runOnMainSync did not produce a result")
        }
        return unwrappedResult
    }

    fileprivate var hasActivePresentationSession: Bool {
        isCurrentlyPresented || sheetViewController != nil
    }

    private func finishSessionOwnershipAndResumeNextIfNeeded() {
        precondition(Thread.isMainThread, "Session ownership updates must run on main thread")
        if let nextOwner = SingleActiveSheetSessionCoordinator.shared.finishSession(for: self) {
            nextOwner.resumeDeferredPresentationIfNeeded()
        }
    }

    fileprivate func resumeDeferredPresentationIfNeeded() {
        runOnMainSync {
            guard shouldPresentWhenHostAttaches || isOpenStorage else {
                SingleActiveSheetSessionCoordinator.shared.cancelPendingPresentation(for: self)
                return
            }
            presentSheet()
        }
    }

    fileprivate func requestCoordinatorDrivenDismissal() {
        runOnMainSync {
            guard hasActivePresentationSession else {
                finishSessionOwnershipAndResumeNextIfNeeded()
                return
            }
            dismissSheet(reason: .programmatic)
        }
    }

    private func presentSheet() {
        guard isHostAttached else {
            shouldPresentWhenHostAttaches = true
            return
        }

        guard !hasActivePresentationSession else {
            shouldPresentWhenHostAttaches = false
            return
        }

        guard let presentingVC = findPresentingViewController() else {
            print("[RnBottomSheet] Could not find presenting view controller")
            return
        }

        guard SingleActiveSheetSessionCoordinator.shared.requestPresentation(for: self) else {
            return
        }

        // Create sheet content view controller
        let contentVC = SheetContentViewController()
        moveChildrenFromStagingToContent()
        contentVC.contentView = contentContainer
        contentVC.isModalInPresentation = !allowSwipeToDismiss
        contentVC.shouldTrackBackdropTapDismissal = { [weak self] in
            guard let self else { return false }
            return self.allowSwipeToDismiss
        }
        contentVC.applyPreferredColorScheme(preferredColorSchemeStorage)
        contentVC.applyContentBackground(
            style: contentBackgroundStyleStorage,
            blurStyle: contentBackgroundBlurStyleStorage
        )

        // Configure sheet presentation
        if let sheet = contentVC.sheetPresentationController {
            configureSheetController(sheet)
        }

        // Store reference
        sheetViewController = SheetPresenterViewController(contentViewController: contentVC)
        sheetViewController?.delegate = self

        // Emit will present callback
        onWillPresent()

        // Present the sheet
        presentingVC.present(contentVC, animated: true) { [weak self] in
            guard let self else { return }
            self.isCurrentlyPresented = true
            self.shouldPresentWhenHostAttaches = false
            self.currentDetentIndex = Int(self.initialDetentIndexStorage)
            self.onDidPresent()
            self.onOpenChange(true, .programmatic)
        }
    }

    private func dismissSheet(reason: NativeChangeReason) {
        shouldPresentWhenHostAttaches = false
        SingleActiveSheetSessionCoordinator.shared.cancelPendingPresentation(for: self)
        guard let contentVC = sheetViewController?.contentViewController else { return }
        contentVC.dismissalReasonOverride = reason
        if contentVC.presentingViewController != nil {
            contentVC.dismiss(animated: true)
        } else {
            // If UIKit already detached the presenter, reset state immediately.
            moveChildrenFromContentToStaging()
            isCurrentlyPresented = false
            sheetViewController = nil
            finishSessionOwnershipAndResumeNextIfNeeded()
        }
    }

    private func snapToDetentInternal(_ index: Int, animated: Bool) {
        guard isCurrentlyPresented,
              let contentVC = sheetViewController?.contentViewController,
              let sheet = contentVC.sheetPresentationController else {
            return
        }

        let detentIdentifiers = buildNativeDetentIdentifiers()
        guard index >= 0 && index < detentIdentifiers.count else {
            print("[RnBottomSheet] Invalid detent index: \(index)")
            return
        }

        let targetIdentifier = detentIdentifiers[index]
        suppressNextDetentDelegateEvent = true

        if animated {
            sheet.animateChanges {
                sheet.selectedDetentIdentifier = targetIdentifier
            }
        } else {
            sheet.selectedDetentIdentifier = targetIdentifier
        }

        currentDetentIndex = index
        onDetentChange(Double(index), .programmatic)
    }

    // =========================================================================
    // MARK: - Sheet Configuration
    // =========================================================================

    private func configureSheetController(_ sheet: UISheetPresentationController) {
        let nativeDetents = buildNativeDetents()
        let detentIdentifiers = buildNativeDetentIdentifiers()

        // Set detents
        sheet.detents = nativeDetents

        // Set initial selection
        let initialIndex = Int(initialDetentIndex)
        if initialIndex >= 0 && initialIndex < detentIdentifiers.count {
            sheet.selectedDetentIdentifier = detentIdentifiers[initialIndex]
        }

        // Configure appearance
        sheet.prefersGrabberVisible = grabberVisible
        sheet.prefersScrollingExpandsWhenScrolledToEdge = expandsWhenScrolledToEdge

        // Configure corner radius
        if cornerRadius >= 0 {
            sheet.preferredCornerRadius = CGFloat(cornerRadius)
        }

        // Configure background interaction
        applyBackgroundInteraction(to: sheet)

        // Set delegate for detent changes
        sheet.delegate = sheetPresentationDelegate
    }

    private func buildNativeDetents() -> [UISheetPresentationController.Detent] {
        let definitions = buildValidatedDetentDefinitions()
        return definitions.map { definition in
            switch definition.kind {
            case .semanticFit:
                if #available(iOS 16.0, *) {
                    return .custom(identifier: definition.identifier) { [weak self] context in
                        guard let self else {
                            return max(120, context.maximumDetentValue * 0.25)
                        }
                        let fittedHeight = self.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
                        if fittedHeight <= 0 {
                            return max(120, context.maximumDetentValue * 0.25)
                        }
                        return min(max(120, fittedHeight), context.maximumDetentValue)
                    }
                }
                return .medium()
            case .semanticMedium:
                return .medium()
            case .semanticLarge:
                return .large()
            case .fraction(let value):
                if #available(iOS 16.0, *) {
                    return .custom(identifier: definition.identifier) { context in
                        return min(context.maximumDetentValue, context.maximumDetentValue * CGFloat(value))
                    }
                }
                return .medium()
            case .points(let value):
                if #available(iOS 16.0, *) {
                    return .custom(identifier: definition.identifier) { context in
                        return min(CGFloat(value), context.maximumDetentValue)
                    }
                }
                return .medium()
            }
        }
    }

    private func buildNativeDetentIdentifiers() -> [UISheetPresentationController.Detent.Identifier] {
        return buildValidatedDetentDefinitions().map(\.identifier)
    }

    private func applyBackgroundInteraction(to sheet: UISheetPresentationController) {
        switch backgroundInteraction {
        case .first(let mode):
            switch mode {
            case "modal":
                sheet.largestUndimmedDetentIdentifier = nil
            case "nonModal":
                sheet.largestUndimmedDetentIdentifier = .large
            default:
                break
            }
        case .second(let index):
            let nativeDetents = buildNativeDetentIdentifiers()
            let idx = Int(index)
            if idx >= 0 && idx < nativeDetents.count {
                sheet.largestUndimmedDetentIdentifier = nativeDetents[idx]
            }
        }
    }

    // =========================================================================
    // MARK: - Update Methods
    // =========================================================================

    private func updateDetentsIfPresented() {
        guard isCurrentlyPresented,
              let contentVC = sheetViewController?.contentViewController,
              let sheet = contentVC.sheetPresentationController else {
            return
        }

        sheet.animateChanges {
            sheet.detents = buildNativeDetents()
        }
    }

    private func updateGrabberVisibility() {
        guard isCurrentlyPresented,
              let contentVC = sheetViewController?.contentViewController,
              let sheet = contentVC.sheetPresentationController else {
            return
        }

        sheet.animateChanges {
            sheet.prefersGrabberVisible = grabberVisible
        }
    }

    private func updateSwipeToDismiss() {
        // Note: UISheetPresentationController doesn't have a direct property for this.
        // We'd need to implement custom gesture handling or use isModalInPresentation.
        guard let contentVC = sheetViewController?.contentViewController else { return }
        contentVC.isModalInPresentation = !allowSwipeToDismiss
    }

    private func updateBackgroundInteraction() {
        guard isCurrentlyPresented,
              let contentVC = sheetViewController?.contentViewController,
              let sheet = contentVC.sheetPresentationController else {
            return
        }

        sheet.animateChanges {
            applyBackgroundInteraction(to: sheet)
        }
    }

    private func updateCornerRadius() {
        guard isCurrentlyPresented,
              let contentVC = sheetViewController?.contentViewController,
              let sheet = contentVC.sheetPresentationController else {
            return
        }

        sheet.animateChanges {
            if cornerRadius >= 0 {
                sheet.preferredCornerRadius = CGFloat(cornerRadius)
            }
        }
    }

    private func updateExpandsWhenScrolledToEdge() {
        guard isCurrentlyPresented,
              let contentVC = sheetViewController?.contentViewController,
              let sheet = contentVC.sheetPresentationController else {
            return
        }

        sheet.animateChanges {
            sheet.prefersScrollingExpandsWhenScrolledToEdge = expandsWhenScrolledToEdge
        }
    }

    private func updatePreferredColorScheme() {
        guard let contentVC = sheetViewController?.contentViewController else {
            return
        }

        contentVC.applyPreferredColorScheme(preferredColorSchemeStorage)
    }

    private func updateContentBackgroundStyle() {
        guard let contentVC = sheetViewController?.contentViewController else {
            return
        }

        contentVC.applyContentBackground(
            style: contentBackgroundStyleStorage,
            blurStyle: contentBackgroundBlurStyleStorage
        )
    }

    // =========================================================================
    // MARK: - Detent Parsing and Validation
    // =========================================================================

    private func buildValidatedDetentDefinitions() -> [ValidatedNativeDetent] {
        var definitions: [ValidatedNativeDetent] = []
        var seenResolvedValues = Set<String>()
        var seenIdentifiers = Set<String>()

        for (index, config) in detents.enumerated() {
            let providedIdentifier = config.identifier
                .trimmingCharacters(in: .whitespacesAndNewlines)

            switch config.type {
            case .semantic:
                guard let value = stringValue(from: config.value) else {
                    print("[RnBottomSheet] Invalid semantic detent at index \(index): missing string value")
                    continue
                }

                let kind: ValidatedNativeDetent.Kind
                let sortValue: Double
                switch value {
                case "fit":
                    kind = .semanticFit
                    sortValue = 0.25
                case "medium":
                    kind = .semanticMedium
                    sortValue = 0.5
                case "large":
                    kind = .semanticLarge
                    sortValue = 1.0
                default:
                    print("[RnBottomSheet] Invalid semantic detent at index \(index): '\(value)'")
                    continue
                }

                let resolvedKey = "semantic:\(value)"
                if seenResolvedValues.contains(resolvedKey) {
                    continue
                }
                seenResolvedValues.insert(resolvedKey)

                let identifierString = providedIdentifier.isEmpty ? value : providedIdentifier
                if seenIdentifiers.contains(identifierString) {
                    print("[RnBottomSheet] Duplicate detent identifier '\(identifierString)'")
                    continue
                }
                seenIdentifiers.insert(identifierString)

                definitions.append(
                    ValidatedNativeDetent(
                        identifier: .init(identifierString),
                        sortValue: sortValue,
                        kind: kind
                    )
                )

            case .fraction:
                guard let value = numericValue(from: config.value) else {
                    print("[RnBottomSheet] Invalid fraction detent at index \(index): value must be numeric")
                    continue
                }
                guard value >= 0, value <= 1 else {
                    print("[RnBottomSheet] Invalid fraction detent at index \(index): value must be between 0 and 1")
                    continue
                }

                let resolvedKey = "fraction:\(value)"
                if seenResolvedValues.contains(resolvedKey) {
                    continue
                }
                seenResolvedValues.insert(resolvedKey)

                let identifierString = providedIdentifier.isEmpty ? "fraction_\(value)" : providedIdentifier
                if seenIdentifiers.contains(identifierString) {
                    print("[RnBottomSheet] Duplicate detent identifier '\(identifierString)'")
                    continue
                }
                seenIdentifiers.insert(identifierString)

                definitions.append(
                    ValidatedNativeDetent(
                        identifier: .init(identifierString),
                        sortValue: value,
                        kind: .fraction(value)
                    )
                )

            case .points:
                guard let value = numericValue(from: config.value) else {
                    print("[RnBottomSheet] Invalid points detent at index \(index): value must be numeric")
                    continue
                }
                guard value > 0 else {
                    print("[RnBottomSheet] Invalid points detent at index \(index): value must be greater than 0")
                    continue
                }

                let resolvedKey = "points:\(value)"
                if seenResolvedValues.contains(resolvedKey) {
                    continue
                }
                seenResolvedValues.insert(resolvedKey)

                let identifierString = providedIdentifier.isEmpty ? "points_\(value)" : providedIdentifier
                if seenIdentifiers.contains(identifierString) {
                    print("[RnBottomSheet] Duplicate detent identifier '\(identifierString)'")
                    continue
                }
                seenIdentifiers.insert(identifierString)

                definitions.append(
                    ValidatedNativeDetent(
                        identifier: .init(identifierString),
                        sortValue: value / 1000,
                        kind: .points(value)
                    )
                )
            }
        }

        if definitions.isEmpty {
            return [
                ValidatedNativeDetent(identifier: .medium, sortValue: 0.5, kind: .semanticMedium),
                ValidatedNativeDetent(identifier: .large, sortValue: 1.0, kind: .semanticLarge),
            ]
        }

        return definitions.sorted {
            if $0.sortValue == $1.sortValue {
                return $0.identifier.rawValue < $1.identifier.rawValue
            }
            return $0.sortValue < $1.sortValue
        }
    }

    private func numericValue(from raw: Variant_String_Double) -> Double? {
        switch raw {
        case .first:
            return nil
        case .second(let value):
            return value
        }
    }

    private func stringValue(from raw: Variant_String_Double) -> String? {
        switch raw {
        case .first(let value):
            return value
        case .second:
            return nil
        }
    }

    // =========================================================================
    // MARK: - Helpers
    // =========================================================================

    private func findPresentingViewController() -> UIViewController? {
        // Find the view controller that can present the sheet
        var responder: UIResponder? = view
        while let nextResponder = responder?.next {
            if let viewController = nextResponder as? UIViewController {
                // Find the topmost presented view controller
                var topVC = viewController
                while let presented = topVC.presentedViewController {
                    topVC = presented
                }
                return topVC
            }
            responder = nextResponder
        }
        return nil
    }

    fileprivate func handleDetentIdentifierChange(_ sheetPresentationController: UISheetPresentationController) {
        runOnMainSync {
            guard let identifier = sheetPresentationController.selectedDetentIdentifier else { return }

            if suppressNextDetentDelegateEvent {
                suppressNextDetentDelegateEvent = false
                return
            }

            let nativeDetents = buildNativeDetentIdentifiers()
            if let index = nativeDetents.firstIndex(where: { $0 == identifier }) {
                currentDetentIndex = index
                onDetentChange(Double(index), .swipe)
            }
        }
    }

    fileprivate func handlePresentationControllerWillDismiss(_ presentationController: UIPresentationController) {
        runOnMainSync {
            guard let contentVC = sheetViewController?.contentViewController else { return }
            let isInteractiveDismissal = presentationController.presentedViewController.transitionCoordinator?.isInteractive ?? false
            contentVC.notePresentationWillDismiss(isInteractive: isInteractiveDismissal)
        }
    }

    fileprivate func hostViewDidAttach() {
        runOnMainSync {
            isHostAttached = true

            if shouldPresentWhenHostAttaches || isOpenStorage {
                presentSheet()
            }
        }
    }

    fileprivate func hostViewDidDetach() {
        runOnMainSync {
            isHostAttached = false
            shouldPresentWhenHostAttaches = false
            SingleActiveSheetSessionCoordinator.shared.cancelPendingPresentation(for: self)

            // If the host leaves the hierarchy, force a clean teardown.
            if hasActivePresentationSession {
                dismissSheet(reason: .system)
            }
        }
    }

    func prepareForRecycle() {
        runOnMainSync {
            shouldPresentWhenHostAttaches = false
            suppressNextDetentDelegateEvent = false
            isBatchUpdatingProps = false
            pendingPropUpdates.removeAll()
            appliedIsOpenState = false

            // Recycled views should not emit callbacks from stale subscriptions.
            onOpenChangeStorage = { _, _ in }
            onDetentChangeStorage = { _, _ in }
            onWillPresentStorage = {}
            onDidPresentStorage = {}
            onWillDismissStorage = {}
            onDidDismissStorage = {}

            if let contentVC = sheetViewController?.contentViewController {
                contentVC.dismissalReasonOverride = .system
                if contentVC.presentingViewController != nil {
                    contentVC.dismiss(animated: false)
                }
            }

            moveChildrenFromContentToStaging()
            isCurrentlyPresented = false
            sheetViewController = nil
            currentDetentIndex = 0
            isHostAttached = view.window != nil

            // Reset props directly so recycle does not trigger redundant update work.
            detentsStorage = []
            initialDetentIndexStorage = 0
            selectedDetentIndexStorage = -1
            isOpenStorage = false
            grabberVisibleStorage = true
            allowSwipeToDismissStorage = true
            backgroundInteractionStorage = .first("modal")
            cornerRadiusStorage = -1
            expandsWhenScrolledToEdgeStorage = true
            preferredColorSchemeStorage = "system"
            contentBackgroundStyleStorage = "system"
            contentBackgroundBlurStyleStorage = "regular"
            SingleActiveSheetSessionCoordinator.shared.cancelPendingPresentation(for: self)
            finishSessionOwnershipAndResumeNextIfNeeded()
        }
    }

    @objc
    func routeChildView(_ childView: UIView, atIndex index: Int) {
        runOnMainSync {
            let targetContainer = hasActivePresentationSession ? contentContainer : view
            if childView.superview !== targetContainer {
                childView.removeFromSuperview()
            }
            let clampedIndex = min(max(index, 0), targetContainer.subviews.count)
            targetContainer.insertSubview(childView, at: clampedIndex)
        }
    }

    @objc
    func unrouteChildView(_ childView: UIView) {
        runOnMainSync {
            if childView.superview === contentContainer || childView.superview === view {
                childView.removeFromSuperview()
            }
        }
    }

    private func moveChildrenFromStagingToContent() {
        moveChildren(from: view, to: contentContainer)
    }

    private func moveChildrenFromContentToStaging() {
        moveChildren(from: contentContainer, to: view)
    }

    private func moveChildren(from source: UIView, to destination: UIView) {
        guard source !== destination else { return }

        let children = source.subviews
        guard !children.isEmpty else { return }

        for childView in children {
            childView.removeFromSuperview()
            destination.addSubview(childView)
        }
    }

}

// =============================================================================
// MARK: - SheetPresenterDelegate
// =============================================================================

extension HybridRnBottomSheet: SheetPresenterDelegate {
    func sheetWillDismiss(reason: NativeChangeReason) {
        runOnMainSync {
            onWillDismiss()
        }
    }

    func sheetDidDismiss(reason: NativeChangeReason) {
        runOnMainSync {
            moveChildrenFromContentToStaging()
            isCurrentlyPresented = false
            sheetViewController = nil
            onDidDismiss()
            onOpenChange(false, reason)
            finishSessionOwnershipAndResumeNextIfNeeded()
        }
    }
}

// =============================================================================
// MARK: - Supporting Types
// =============================================================================

private struct ValidatedNativeDetent {
    enum Kind {
        case semanticFit
        case semanticMedium
        case semanticLarge
        case fraction(Double)
        case points(Double)
    }

    let identifier: UISheetPresentationController.Detent.Identifier
    let sortValue: Double
    let kind: Kind
}

/// Enforces the v1 one-active-sheet constraint and coordinates deterministic handoff
/// when a newer sheet requests presentation while another session is active.
private final class SingleActiveSheetSessionCoordinator {
    static let shared = SingleActiveSheetSessionCoordinator()

    private weak var activeOwner: HybridRnBottomSheet?
    private weak var pendingOwner: HybridRnBottomSheet?
    private var isCoordinatorDismissalInFlight: Bool = false

    private init() {}

    func requestPresentation(for owner: HybridRnBottomSheet) -> Bool {
        precondition(Thread.isMainThread, "Session coordinator must be used on main thread")

        if let currentOwner = activeOwner, currentOwner !== owner {
            if !currentOwner.hasActivePresentationSession {
                activeOwner = nil
                isCoordinatorDismissalInFlight = false
            } else {
                pendingOwner = owner
                if !isCoordinatorDismissalInFlight {
                    isCoordinatorDismissalInFlight = true
                    currentOwner.requestCoordinatorDrivenDismissal()
                }
                return false
            }
        }

        activeOwner = owner
        if pendingOwner === owner {
            pendingOwner = nil
        }
        return true
    }

    func cancelPendingPresentation(for owner: HybridRnBottomSheet) {
        precondition(Thread.isMainThread, "Session coordinator must be used on main thread")

        if pendingOwner === owner {
            pendingOwner = nil
        }

        if pendingOwner == nil {
            isCoordinatorDismissalInFlight = false
        }
    }

    func finishSession(for owner: HybridRnBottomSheet) -> HybridRnBottomSheet? {
        precondition(Thread.isMainThread, "Session coordinator must be used on main thread")

        if activeOwner === owner {
            activeOwner = nil
        }

        guard activeOwner == nil else {
            return nil
        }

        let nextOwner = pendingOwner
        pendingOwner = nil
        isCoordinatorDismissalInFlight = false
        activeOwner = nextOwner
        return nextOwner
    }
}

/// Protocol for sheet presenter delegate
protocol SheetPresenterDelegate: AnyObject {
    func sheetWillDismiss(reason: NativeChangeReason)
    func sheetDidDismiss(reason: NativeChangeReason)
}

/// Wrapper to track sheet presenter state
class SheetPresenterViewController {
    weak var delegate: SheetPresenterDelegate?
    let contentViewController: SheetContentViewController

    init(contentViewController: SheetContentViewController) {
        self.contentViewController = contentViewController
        contentViewController.presenterDelegate = self
    }
}

extension SheetPresenterViewController: SheetPresenterDelegate {
    func sheetWillDismiss(reason: NativeChangeReason) {
        delegate?.sheetWillDismiss(reason: reason)
    }

    func sheetDidDismiss(reason: NativeChangeReason) {
        delegate?.sheetDidDismiss(reason: reason)
    }
}

/// NSObject-backed proxy used for UISheetPresentationController delegate callbacks.
private final class SheetPresentationDelegateProxy: NSObject, UISheetPresentationControllerDelegate {
    weak var owner: HybridRnBottomSheet?

    init(owner: HybridRnBottomSheet) {
        self.owner = owner
    }

    func sheetPresentationControllerDidChangeSelectedDetentIdentifier(_ sheetPresentationController: UISheetPresentationController) {
        owner?.handleDetentIdentifierChange(sheetPresentationController)
    }

    func presentationControllerWillDismiss(_ presentationController: UIPresentationController) {
        owner?.handlePresentationControllerWillDismiss(presentationController)
    }
}

/// Nitro host view used as the staging area and attach/detach lifecycle source.
/// This view stays in the React tree permanently. When the sheet is not presented,
/// React children are held here (invisible, zero layout size). When the sheet
/// presents, children are moved to the `SheetContentContainerView`.
final class SheetHostContainerView: UIView {
    weak var lifecycleOwner: HybridRnBottomSheet?
    private var isCurrentlyAttached: Bool = false

    override init(frame: CGRect) {
        super.init(frame: frame)
        isHidden = true
        isUserInteractionEnabled = false
        clipsToBounds = true
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        isHidden = true
        isUserInteractionEnabled = false
        clipsToBounds = true
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()

        let isAttached = window != nil
        guard isAttached != isCurrentlyAttached else { return }
        isCurrentlyAttached = isAttached

        if isAttached {
            lifecycleOwner?.hostViewDidAttach()
        } else {
            lifecycleOwner?.hostViewDidDetach()
        }
    }

    @objc
    func routeChild(_ childView: UIView, atIndex index: Int) {
        lifecycleOwner?.routeChildView(childView, atIndex: index)
    }

    @objc
    func unrouteChild(_ childView: UIView) {
        lifecycleOwner?.unrouteChildView(childView)
    }
}

final class SheetContentContainerView: UIView {
    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        backgroundColor = .clear
    }
}


/// View controller that hosts the React Native content inside the sheet
class SheetContentViewController: UIViewController {
    weak var presenterDelegate: SheetPresenterDelegate?
    var dismissalReasonOverride: NativeChangeReason?
    private var isSystemDismissalCandidate: Bool = false
    private var wasInteractiveDismissal: Bool?
    private var lastBackdropTapTimestamp: TimeInterval?
    private var backdropTapGestureRecognizer: UITapGestureRecognizer?
    private let backdropDismissalInferenceWindow: TimeInterval = 0.5
    private var touchHandler: NSObject?
    private var backgroundStyleMode: String = "system"
    private var backgroundBlurStyle: String = "regular"
    private var backgroundEffectView: UIVisualEffectView?
    var shouldTrackBackdropTapDismissal: () -> Bool = { true }
    var contentView: UIView? {
        didSet {
            if isViewLoaded {
                setupContentView()
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        attachTouchHandlerIfNeeded()
        view.backgroundColor = .systemBackground
        setupContentView()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        installBackdropTapObserverIfNeeded()
    }

    private func setupContentView() {
        // Rebuild hierarchy to keep content full-width while applying background mode.
        view.subviews.forEach { $0.removeFromSuperview() }
        backgroundEffectView = nil

        applyBackgroundMode()

        if let content = contentView {
            content.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(content)
            NSLayoutConstraint.activate([
                content.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                content.trailingAnchor.constraint(equalTo: view.trailingAnchor),
                content.topAnchor.constraint(equalTo: view.topAnchor),
                content.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            ])
        }
    }

    func applyPreferredColorScheme(_ scheme: String) {
        switch scheme {
        case "light":
            overrideUserInterfaceStyle = .light
        case "dark":
            overrideUserInterfaceStyle = .dark
        default:
            overrideUserInterfaceStyle = .unspecified
        }
    }

    func applyContentBackground(style: String, blurStyle: String) {
        let normalizedStyle: String
        switch style {
        case "system", "blur", "clear":
            normalizedStyle = style
        default:
            normalizedStyle = "system"
        }

        let normalizedBlurStyle: String
        switch blurStyle {
        case "regular", "prominent", "light", "dark":
            normalizedBlurStyle = blurStyle
        default:
            normalizedBlurStyle = "regular"
        }

        backgroundStyleMode = normalizedStyle
        backgroundBlurStyle = normalizedBlurStyle

        if isViewLoaded {
            setupContentView()
        }
    }

    private func applyBackgroundMode() {
        switch backgroundStyleMode {
        case "clear":
            view.backgroundColor = .clear
        case "blur":
            view.backgroundColor = .clear
            let blurView = UIVisualEffectView(effect: UIBlurEffect(style: resolveBlurEffectStyle()))
            blurView.isUserInteractionEnabled = false
            blurView.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(blurView)
            NSLayoutConstraint.activate([
                blurView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                blurView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
                blurView.topAnchor.constraint(equalTo: view.topAnchor),
                blurView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            ])
            backgroundEffectView = blurView
        default:
            view.backgroundColor = .systemBackground
        }
    }

    private func resolveBlurEffectStyle() -> UIBlurEffect.Style {
        switch backgroundBlurStyle {
        case "prominent":
            return .prominent
        case "light":
            return .light
        case "dark":
            return .dark
        default:
            return .regular
        }
    }

    func notePresentationWillDismiss(isInteractive: Bool) {
        guard dismissalReasonOverride == nil else { return }
        wasInteractiveDismissal = isInteractive

        if wasBackdropTapRecently() {
            isSystemDismissalCandidate = false
            return
        }

        // Non-interactive dismissals without a backdrop tap are treated as system-driven.
        isSystemDismissalCandidate = !isInteractive
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if isBeingDismissed {
            let reason = resolveDismissalReason()
            presenterDelegate?.sheetWillDismiss(reason: reason)
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if isBeingDismissed {
            let reason = resolveDismissalReason()
            presenterDelegate?.sheetDidDismiss(reason: reason)
            clearDismissalTracking()
        }
    }

    private func installBackdropTapObserverIfNeeded() {
        guard backdropTapGestureRecognizer == nil,
              let containerView = presentationController?.containerView else {
            return
        }

        let recognizer = UITapGestureRecognizer(target: self, action: #selector(handleContainerTap(_:)))
        recognizer.cancelsTouchesInView = false
        recognizer.delegate = self
        containerView.addGestureRecognizer(recognizer)
        backdropTapGestureRecognizer = recognizer
    }

    @objc
    private func handleContainerTap(_ recognizer: UITapGestureRecognizer) {
        guard recognizer.state == .ended,
              shouldTrackBackdropTapDismissal(),
              let containerView = presentationController?.containerView,
              let presentedView = presentationController?.presentedView else {
            return
        }

        let location = recognizer.location(in: containerView)
        if !presentedView.frame.contains(location) {
            lastBackdropTapTimestamp = Date().timeIntervalSinceReferenceDate
        }
    }

    private func resolveDismissalReason() -> NativeChangeReason {
        if let override = dismissalReasonOverride {
            return override
        }

        if wasInteractiveDismissal == true {
            return .swipe
        }

        if wasBackdropTapRecently() {
            return .backdrop
        }

        if isSystemDismissalCandidate {
            return .system
        }

        return .swipe
    }

    private func wasBackdropTapRecently() -> Bool {
        guard let tapTimestamp = lastBackdropTapTimestamp else {
            return false
        }

        let now = Date().timeIntervalSinceReferenceDate
        return (now - tapTimestamp) <= backdropDismissalInferenceWindow
    }

    private func clearDismissalTracking() {
        dismissalReasonOverride = nil
        isSystemDismissalCandidate = false
        wasInteractiveDismissal = nil
        lastBackdropTapTimestamp = nil
    }

    deinit {
        detachTouchHandler()
    }

    private func attachTouchHandlerIfNeeded() {
        if touchHandler == nil {
            touchHandler = makeTouchHandler()
        }

        guard let touchHandler else { return }
        let selector = NSSelectorFromString("attachToView:")
        if touchHandler.responds(to: selector) {
            _ = touchHandler.perform(selector, with: view)
        }
    }

    private func detachTouchHandler() {
        guard let touchHandler else { return }
        let selector = NSSelectorFromString("detachFromCurrentView")
        if touchHandler.responds(to: selector) {
            _ = touchHandler.perform(selector)
        }
    }

    private func makeTouchHandler() -> NSObject? {
        let candidateNames = [
            "SheetSurfaceTouchHandler",
            "RnBottomSheet.SheetSurfaceTouchHandler",
        ]

        for className in candidateNames {
            if let touchHandlerClass = NSClassFromString(className) as? NSObject.Type {
                return touchHandlerClass.init()
            }
        }

        return nil
    }
}

extension SheetContentViewController: UIGestureRecognizerDelegate {
    func gestureRecognizer(
        _ gestureRecognizer: UIGestureRecognizer,
        shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer
    ) -> Bool {
        return true
    }
}
