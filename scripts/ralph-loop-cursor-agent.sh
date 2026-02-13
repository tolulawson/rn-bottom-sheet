#!/bin/bash
#
# Ralph Loop for Cursor Agent CLI
#
# Based on Geoffrey Huntley's Ralph Wiggum methodology.
# Combined with SpecKit-style specifications.
#
# Usage:
#   ./scripts/ralph-loop-cursor-agent.sh
#   ./scripts/ralph-loop-cursor-agent.sh 20
#   ./scripts/ralph-loop-cursor-agent.sh plan
#   ./scripts/ralph-loop-cursor-agent.sh --model gpt-5.3-codex-high
#

set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
CONSTITUTION="$PROJECT_DIR/.specify/memory/constitution.md"
RLM_DIR="$PROJECT_DIR/rlm"
RLM_TRACE_DIR="$RLM_DIR/trace"
RLM_QUERIES_DIR="$RLM_DIR/queries"
RLM_ANSWERS_DIR="$RLM_DIR/answers"
RLM_INDEX="$RLM_DIR/index.tsv"

# Configuration
MAX_ITERATIONS=0  # 0 = unlimited
MODE="build"
RLM_CONTEXT_FILE=""
CURSOR_AGENT_CMD="${CURSOR_AGENT_CMD:-cursor-agent}"
MODEL="${MODEL:-gpt-5.3-codex-high}"
TAIL_LINES=5
TAIL_RENDERED_LINES=0
ROLLING_OUTPUT_LINES=5
ROLLING_OUTPUT_INTERVAL=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

mkdir -p "$LOG_DIR"

# Check constitution for YOLO setting
YOLO_ENABLED=true
if [[ -f "$CONSTITUTION" ]]; then
    if grep -q "YOLO Mode.*DISABLED" "$CONSTITUTION" 2>/dev/null; then
        YOLO_ENABLED=false
    fi
fi

show_help() {
    cat <<EOF
Ralph Loop for Cursor Agent CLI

Usage:
  ./scripts/ralph-loop-cursor-agent.sh
  ./scripts/ralph-loop-cursor-agent.sh 20
  ./scripts/ralph-loop-cursor-agent.sh plan
  ./scripts/ralph-loop-cursor-agent.sh --model gpt-5.3-codex-high
  ./scripts/ralph-loop-cursor-agent.sh --rlm-context ./rlm/context.txt
  ./scripts/ralph-loop-cursor-agent.sh --rlm ./rlm/context.txt

Options:
  -m, --model <name>   Cursor model name (default: gpt-5.3-codex-high)
  --rlm-context <file> Treat large context file as external environment
  --rlm [file]         Shortcut for --rlm-context (default: rlm/context.txt)

Modes:
  build (default)  Pick incomplete spec and implement
  plan             Create IMPLEMENTATION_PLAN.md (OPTIONAL)

EOF
}

print_latest_output() {
    local log_file="$1"
    local label="${2:-Cursor Agent}"
    local target="/dev/tty"

    [ -f "$log_file" ] || return 0

    if [ ! -w "$target" ]; then
        target="/dev/stdout"
    fi

    if [ "$target" = "/dev/tty" ] && [ "$TAIL_RENDERED_LINES" -gt 0 ]; then
        printf "\033[%dA\033[J" "$TAIL_RENDERED_LINES" > "$target"
    fi

    {
        echo "Latest ${label} output (last ${TAIL_LINES} lines):"
        tail -n "$TAIL_LINES" "$log_file"
    } > "$target"

    if [ "$target" = "/dev/tty" ]; then
        TAIL_RENDERED_LINES=$((TAIL_LINES + 1))
    fi
}

watch_latest_output() {
    local log_file="$1"
    local label="${2:-Cursor Agent}"
    local target="/dev/tty"

    [ -f "$log_file" ] || return 0

    if [ ! -w "$target" ]; then
        target="/dev/stdout"
    fi

    while true; do
        local timestamp
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')

        {
            echo -e "${CYAN}[$timestamp] Latest ${label} output (last ${ROLLING_OUTPUT_LINES} lines):${NC}"
            if [ ! -s "$log_file" ]; then
                echo "(no output yet)"
            else
                tail -n "$ROLLING_OUTPUT_LINES" "$log_file" 2>/dev/null || true
            fi
            echo ""
        } > "$target"

        sleep "$ROLLING_OUTPUT_INTERVAL"
    done
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        plan)
            MODE="plan"
            if [[ "${2:-}" =~ ^[0-9]+$ ]]; then
                MAX_ITERATIONS="$2"
                shift 2
            else
                MAX_ITERATIONS=1
                shift
            fi
            ;;
        -m|--model)
            MODEL="${2:-}"
            shift 2
            ;;
        --rlm-context)
            RLM_CONTEXT_FILE="${2:-}"
            shift 2
            ;;
        --rlm)
            if [[ -n "${2:-}" && "${2:0:1}" != "-" ]]; then
                RLM_CONTEXT_FILE="$2"
                shift 2
            else
                RLM_CONTEXT_FILE="rlm/context.txt"
                shift
            fi
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        [0-9]*)
            MODE="build"
            MAX_ITERATIONS="$1"
            shift
            ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

if [ -z "$MODEL" ]; then
    echo -e "${RED}Error: --model requires a value${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

if [ -n "$RLM_CONTEXT_FILE" ] && [ ! -f "$RLM_CONTEXT_FILE" ]; then
    echo -e "${RED}Error: RLM context file not found: $RLM_CONTEXT_FILE${NC}"
    exit 1
fi

if [ -n "$RLM_CONTEXT_FILE" ]; then
    mkdir -p "$RLM_TRACE_DIR" "$RLM_QUERIES_DIR" "$RLM_ANSWERS_DIR"
    if [ ! -f "$RLM_INDEX" ]; then
        echo -e "timestamp\tmode\titeration\tprompt\tlog\toutput\tstatus" > "$RLM_INDEX"
    fi
fi

SESSION_LOG="$LOG_DIR/ralph_cursor_agent_${MODE}_session_$(date '+%Y%m%d_%H%M%S').log"
exec > >(tee -a "$SESSION_LOG") 2>&1

if ! command -v "$CURSOR_AGENT_CMD" &> /dev/null; then
    echo -e "${RED}Error: Cursor Agent CLI not found${NC}"
    echo "Install and authenticate Cursor Agent CLI first."
    exit 1
fi

if [ "$MODE" = "plan" ]; then
    PROMPT_FILE="PROMPT_plan.md"
else
    PROMPT_FILE="PROMPT_build.md"
fi

if [ ! -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: $PROMPT_FILE not found${NC}"
    exit 1
fi

CURSOR_AGENT_FLAGS=(--print --output-format text --model "$MODEL")
if [ "$YOLO_ENABLED" = true ]; then
    CURSOR_AGENT_FLAGS+=(--force)
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}        RALPH LOOP (Cursor Agent) STARTING                  ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Mode:${NC}     $MODE"
echo -e "${BLUE}Prompt:${NC}   $PROMPT_FILE"
echo -e "${BLUE}Branch:${NC}   $CURRENT_BRANCH"
echo -e "${BLUE}Model:${NC}    $MODEL"
echo -e "${YELLOW}YOLO:${NC}     $([ "$YOLO_ENABLED" = true ] && echo "ENABLED (--force)" || echo "DISABLED")"
[ -n "$RLM_CONTEXT_FILE" ] && echo -e "${BLUE}RLM:${NC}      $RLM_CONTEXT_FILE"
[ -n "$SESSION_LOG" ] && echo -e "${BLUE}Log:${NC}      $SESSION_LOG"
[ $MAX_ITERATIONS -gt 0 ] && echo -e "${BLUE}Max:${NC}      $MAX_ITERATIONS iterations"
echo ""
echo -e "${CYAN}Using: $CURSOR_AGENT_CMD ${CURSOR_AGENT_FLAGS[*]}${NC}"
echo -e "${CYAN}Agent must output <promise>DONE</promise> when complete.${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the loop${NC}"
echo ""

ITERATION=0
CONSECUTIVE_FAILURES=0
MAX_CONSECUTIVE_FAILURES=3

while true; do
    if [ $MAX_ITERATIONS -gt 0 ] && [ $ITERATION -ge $MAX_ITERATIONS ]; then
        echo -e "${GREEN}Reached max iterations: $MAX_ITERATIONS${NC}"
        break
    fi

    ITERATION=$((ITERATION + 1))
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo ""
    echo -e "${PURPLE}════════════════════ LOOP $ITERATION ════════════════════${NC}"
    echo -e "${BLUE}[$TIMESTAMP]${NC} Starting iteration $ITERATION"
    echo ""

    LOG_FILE="$LOG_DIR/ralph_cursor_agent_${MODE}_iter_${ITERATION}_$(date '+%Y%m%d_%H%M%S').log"
    : > "$LOG_FILE"
    WATCH_PID=""

    if [ "$ROLLING_OUTPUT_INTERVAL" -gt 0 ] && [ "$ROLLING_OUTPUT_LINES" -gt 0 ] && [ -t 1 ] && [ -w /dev/tty ]; then
        watch_latest_output "$LOG_FILE" "Cursor Agent" &
        WATCH_PID=$!
    fi

    EFFECTIVE_PROMPT_FILE="$PROMPT_FILE"
    if [ -n "$RLM_CONTEXT_FILE" ]; then
        EFFECTIVE_PROMPT_FILE="$LOG_DIR/ralph_cursor_agent_prompt_iter_${ITERATION}_$(date '+%Y%m%d_%H%M%S').md"
        cat "$PROMPT_FILE" > "$EFFECTIVE_PROMPT_FILE"
        cat >> "$EFFECTIVE_PROMPT_FILE" << EOF

---
## RLM Context (Optional)

You have access to a large context file at:
**$RLM_CONTEXT_FILE**

Treat this file as an external environment. Do NOT paste the whole file into the prompt.
Inspect only the slices you need.
EOF
        RLM_PROMPT_SNAPSHOT="$RLM_TRACE_DIR/iter_${ITERATION}_prompt.md"
        cp "$EFFECTIVE_PROMPT_FILE" "$RLM_PROMPT_SNAPSHOT"
    fi

    PROMPT_CONTENT="$(cat "$EFFECTIVE_PROMPT_FILE")"

    if "$CURSOR_AGENT_CMD" "${CURSOR_AGENT_FLAGS[@]}" "$PROMPT_CONTENT" 2>&1 | tee "$LOG_FILE"; then
        if [ -n "$WATCH_PID" ]; then
            kill "$WATCH_PID" 2>/dev/null || true
            wait "$WATCH_PID" 2>/dev/null || true
        fi
        echo ""
        echo -e "${GREEN}✓ Cursor Agent execution completed${NC}"

        if grep -qE "<promise>(ALL_)?DONE</promise>" "$LOG_FILE"; then
            DETECTED_SIGNAL=$(grep -oE "<promise>(ALL_)?DONE</promise>" "$LOG_FILE" | tail -1)
            echo -e "${GREEN}✓ Completion signal detected: ${DETECTED_SIGNAL}${NC}"
            echo -e "${GREEN}✓ Task completed successfully!${NC}"
            CONSECUTIVE_FAILURES=0

            if [ "$MODE" = "plan" ]; then
                echo ""
                echo -e "${GREEN}Planning complete!${NC}"
                break
            fi
        else
            echo -e "${YELLOW}⚠ No completion signal found${NC}"
            echo -e "${YELLOW}  Agent did not output <promise>DONE</promise> or <promise>ALL_DONE</promise>${NC}"
            echo -e "${YELLOW}  Retrying in next iteration...${NC}"
            CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
            print_latest_output "$LOG_FILE" "Cursor Agent"
        fi
    else
        if [ -n "$WATCH_PID" ]; then
            kill "$WATCH_PID" 2>/dev/null || true
            wait "$WATCH_PID" 2>/dev/null || true
        fi
        echo -e "${RED}✗ Cursor Agent execution failed${NC}"
        echo -e "${YELLOW}Check log: $LOG_FILE${NC}"
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        print_latest_output "$LOG_FILE" "Cursor Agent"
    fi

    if [ $CONSECUTIVE_FAILURES -ge $MAX_CONSECUTIVE_FAILURES ]; then
        echo ""
        echo -e "${RED}⚠ $MAX_CONSECUTIVE_FAILURES consecutive iterations without completion.${NC}"
        CONSECUTIVE_FAILURES=0
    fi

    if [ -n "$RLM_CONTEXT_FILE" ]; then
        RLM_OUTPUT_SNAPSHOT="$RLM_TRACE_DIR/iter_${ITERATION}_output.log"
        cp "$LOG_FILE" "$RLM_OUTPUT_SNAPSHOT"
        echo -e "${TIMESTAMP}\t${MODE}\t${ITERATION}\t${RLM_PROMPT_SNAPSHOT}\t${LOG_FILE}\t${RLM_OUTPUT_SNAPSHOT}\tunknown" >> "$RLM_INDEX"
    fi

    git push origin "$CURRENT_BRANCH" 2>/dev/null || {
        if git log origin/$CURRENT_BRANCH..HEAD --oneline 2>/dev/null | grep -q .; then
            git push -u origin "$CURRENT_BRANCH" 2>/dev/null || true
        fi
    }

    echo ""
    echo -e "${BLUE}Waiting 2s before next iteration...${NC}"
    sleep 2
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}    RALPH LOOP (Cursor Agent) FINISHED ($ITERATION iterations)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
