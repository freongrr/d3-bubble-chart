export default class EventManager {

    constructor(supportedEventTypes = []) {
        this.supportedEventTypes = new Set(supportedEventTypes);
        this.listeners = {};
    }

    fireEvent(eventType) {
        const listener = this.listeners[eventType];
        if (listener) {
            const copyOfArguments = [...arguments];
            copyOfArguments.shift();
            try {
                listener.apply(null, copyOfArguments);
            } catch (e) {
                console.error(`Error in '${eventType}' event listener`, e);
            }
        }
    }

    register(eventType, listener) {
        if (this.supportedEventTypes.has(eventType)) {
            if (listener) {
                this.listeners[eventType] = listener;
            } else {
                delete this.listeners[eventType];
            }
        } else {
            console.warn("Unsupported event type: " + eventType);
        }
        return this;
    }
}
