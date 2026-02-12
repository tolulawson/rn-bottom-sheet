import UIKit

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
class HybridRnBottomSheet: HybridRnBottomSheetSpec {

    // =========================================================================
    // MARK: - UIView (required by HybridViewSpec)
    // =========================================================================

    var view: UIView = UIView()

    // =========================================================================
    // MARK: - Sheet State
    // =========================================================================

    /// Current presentation state
    private var isCurrentlyPresented: Bool = false

    /// Current detent index
    private var currentDetentIndex: Int = 0

    /// Sheet presenter view controller (lazy initialized)
    private var sheetViewController: SheetPresenterViewController?

    // =========================================================================
    // MARK: - Props (conforming to HybridRnBottomSheetSpec)
    // =========================================================================

    /// Detent configurations
    var detents: [[String: Any]] = [] {
        didSet {
            updateDetentsIfPresented()
        }
    }

    /// Initial detent index when sheet opens
    var initialDetentIndex: Double = 0

    /// Selected detent index (-1 for uncontrolled)
    var selectedDetentIndex: Double = -1 {
        didSet {
            if selectedDetentIndex >= 0 {
                snapToDetentInternal(Int(selectedDetentIndex), animated: true)
            }
        }
    }

    /// Whether sheet should be open
    var isOpen: Bool = false {
        didSet {
            handleOpenStateChange(oldValue: oldValue)
        }
    }

    /// Show grabber handle
    var grabberVisible: Bool = true {
        didSet {
            updateGrabberVisibility()
        }
    }

    /// Allow swipe to dismiss
    var allowSwipeToDismiss: Bool = true {
        didSet {
            updateSwipeToDismiss()
        }
    }

    /// Background interaction mode
    var backgroundInteraction: Any = "modal" {
        didSet {
            updateBackgroundInteraction()
        }
    }

    /// Corner radius (-1 for system default)
    var cornerRadius: Double = -1 {
        didSet {
            updateCornerRadius()
        }
    }

    /// Expand when scrolled to edge
    var expandsWhenScrolledToEdge: Bool = true {
        didSet {
            updateExpandsWhenScrolledToEdge()
        }
    }

    // =========================================================================
    // MARK: - Callbacks (conforming to HybridRnBottomSheetSpec)
    // =========================================================================

    var onOpenChange: ((Bool, String) -> Void)?
    var onDetentChange: ((Double, String) -> Void)?
    var onWillPresent: (() -> Void)?
    var onDidPresent: (() -> Void)?
    var onWillDismiss: (() -> Void)?
    var onDidDismiss: (() -> Void)?

    // =========================================================================
    // MARK: - Methods (conforming to HybridRnBottomSheetSpec)
    // =========================================================================

    func present() {
        guard !isCurrentlyPresented else { return }
        presentSheet()
    }

    func dismiss() {
        guard isCurrentlyPresented else { return }
        dismissSheet(reason: "programmatic")
    }

    func snapToDetent(index: Double) {
        snapToDetentInternal(Int(index), animated: true)
    }

    func getCurrentDetentIndex() -> Double {
        return Double(currentDetentIndex)
    }

    // =========================================================================
    // MARK: - Private Implementation
    // =========================================================================

    private func handleOpenStateChange(oldValue: Bool) {
        if isOpen && !oldValue {
            presentSheet()
        } else if !isOpen && oldValue {
            dismissSheet(reason: "programmatic")
        }
    }

    private func presentSheet() {
        guard let presentingVC = findPresentingViewController() else {
            print("[RnBottomSheet] Could not find presenting view controller")
            return
        }

        // Create sheet content view controller
        let contentVC = SheetContentViewController()
        contentVC.contentView = view

        // Configure sheet presentation
        if let sheet = contentVC.sheetPresentationController {
            configureSheetController(sheet)
        }

        // Store reference
        sheetViewController = SheetPresenterViewController(contentViewController: contentVC)
        sheetViewController?.delegate = self

        // Emit will present callback
        onWillPresent?()

        // Present the sheet
        presentingVC.present(contentVC, animated: true) { [weak self] in
            self?.isCurrentlyPresented = true
            self?.currentDetentIndex = Int(self?.initialDetentIndex ?? 0)
            self?.onDidPresent?()
            self?.onOpenChange?(true, "programmatic")
        }
    }

    private func dismissSheet(reason: String) {
        guard let contentVC = sheetViewController?.contentViewController else { return }

        onWillDismiss?()

        contentVC.dismiss(animated: true) { [weak self] in
            self?.isCurrentlyPresented = false
            self?.sheetViewController = nil
            self?.onDidDismiss?()
            self?.onOpenChange?(false, reason)
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

        if animated {
            sheet.animateChanges {
                sheet.selectedDetentIdentifier = targetIdentifier
            }
        } else {
            sheet.selectedDetentIdentifier = targetIdentifier
        }

        currentDetentIndex = index
        onDetentChange?(Double(index), "programmatic")
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
        sheet.delegate = self
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
        if let mode = backgroundInteraction as? String {
            switch mode {
            case "modal":
                sheet.largestUndimmedDetentIdentifier = nil
            case "nonModal":
                sheet.largestUndimmedDetentIdentifier = .large
            default:
                break
            }
        } else if let index = backgroundInteraction as? Double {
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

    // =========================================================================
    // MARK: - Detent Parsing and Validation
    // =========================================================================

    private func buildValidatedDetentDefinitions() -> [ValidatedNativeDetent] {
        var definitions: [ValidatedNativeDetent] = []
        var seenResolvedValues = Set<String>()
        var seenIdentifiers = Set<String>()

        for (index, config) in detents.enumerated() {
            guard let type = config["type"] as? String else {
                print("[RnBottomSheet] Invalid detent at index \(index): missing 'type'")
                continue
            }

            let providedIdentifier = (config["identifier"] as? String)?
                .trimmingCharacters(in: .whitespacesAndNewlines)

            switch type {
            case "semantic":
                guard let value = config["value"] as? String else {
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

                let identifierString = (providedIdentifier?.isEmpty == false ? providedIdentifier! : value)
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

            case "fraction":
                guard let value = numericValue(from: config["value"]) else {
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

                let identifierString = (providedIdentifier?.isEmpty == false ? providedIdentifier! : "fraction_\(value)")
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

            case "points":
                guard let value = numericValue(from: config["value"]) else {
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

                let identifierString = (providedIdentifier?.isEmpty == false ? providedIdentifier! : "points_\(value)")
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

            default:
                print("[RnBottomSheet] Invalid detent at index \(index): unsupported type '\(type)'")
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

    private func numericValue(from raw: Any?) -> Double? {
        if let value = raw as? Double {
            return value
        }
        if let value = raw as? NSNumber {
            return value.doubleValue
        }
        return nil
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
}

// =============================================================================
// MARK: - UISheetPresentationControllerDelegate
// =============================================================================

extension HybridRnBottomSheet: UISheetPresentationControllerDelegate {
    func sheetPresentationControllerDidChangeSelectedDetentIdentifier(_ sheetPresentationController: UISheetPresentationController) {
        // Find the index of the new detent
        guard let identifier = sheetPresentationController.selectedDetentIdentifier else { return }

        let nativeDetents = buildNativeDetentIdentifiers()
        if let index = nativeDetents.firstIndex(where: { $0 == identifier }) {
            currentDetentIndex = index
            onDetentChange?(Double(index), "swipe")
        }
    }
}

// =============================================================================
// MARK: - SheetPresenterDelegate
// =============================================================================

extension HybridRnBottomSheet: SheetPresenterDelegate {
    func sheetWillDismiss(reason: String) {
        onWillDismiss?()
    }

    func sheetDidDismiss(reason: String) {
        isCurrentlyPresented = false
        sheetViewController = nil
        onDidDismiss?()
        onOpenChange?(false, reason)
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

/// Protocol for sheet presenter delegate
protocol SheetPresenterDelegate: AnyObject {
    func sheetWillDismiss(reason: String)
    func sheetDidDismiss(reason: String)
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
    func sheetWillDismiss(reason: String) {
        delegate?.sheetWillDismiss(reason: reason)
    }

    func sheetDidDismiss(reason: String) {
        delegate?.sheetDidDismiss(reason: reason)
    }
}

/// View controller that hosts the React Native content inside the sheet
class SheetContentViewController: UIViewController {
    weak var presenterDelegate: SheetPresenterDelegate?
    var contentView: UIView? {
        didSet {
            if isViewLoaded {
                setupContentView()
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        setupContentView()
    }

    private func setupContentView() {
        // Remove old content
        view.subviews.forEach { $0.removeFromSuperview() }

        // Add new content
        if let content = contentView {
            view.addSubview(content)
            content.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                content.topAnchor.constraint(equalTo: view.topAnchor),
                content.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                content.trailingAnchor.constraint(equalTo: view.trailingAnchor),
                content.bottomAnchor.constraint(equalTo: view.bottomAnchor)
            ])
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if isBeingDismissed {
            // Determine dismissal reason
            let reason = isModalInPresentation ? "programmatic" : "swipe"
            presenterDelegate?.sheetWillDismiss(reason: reason)
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if isBeingDismissed {
            let reason = isModalInPresentation ? "programmatic" : "swipe"
            presenterDelegate?.sheetDidDismiss(reason: reason)
        }
    }
}
