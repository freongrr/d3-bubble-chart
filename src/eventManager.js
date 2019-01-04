export default class EventManager {

    constructor(supportedEventTypes = []) {
        this.supportedEventTypes = new Set(supportedEventTypes);
        this.listeners = {};
    }

    fireEvent(type) {
        if (this.listeners[type]) {
            const copyOfArguments = [...arguments];
            copyOfArguments.shift();
            this.listeners[type].forEach(l => {
                try {
                    l.apply(null, copyOfArguments);
                } catch (e) {
                    console.error(`Error in '${type}' event listener`, e);
                }
            });
        }
    }

    register(eventType, listener) {
        if (this.supportedEventTypes.has(eventType)) {
            if (this.listeners[eventType]) {
                this.listeners[eventType].push(listener);
            } else {
                this.listeners[eventType] = [listener];
            }
        } else {
            console.warn("Unsupported event type: " + eventType);
        }
        return this;
    }
}
