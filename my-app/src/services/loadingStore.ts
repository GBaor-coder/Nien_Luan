type Listener = () => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const loadingStore = {
  get active() {
    return pendingCount > 0;
  },
  start() {
    pendingCount += 1;
    emit();
  },
  stop() {
    pendingCount = Math.max(0, pendingCount - 1);
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
