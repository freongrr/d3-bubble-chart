import EventManager from "../src/eventManager";

test("when firing an event and there is no listener registered then nothing (bad) happens", () => {
    const eventManager = new EventManager(["test"]);
    eventManager.fireEvent("test");
});

test("when firing an event then only the listener registered for that type is invoked", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const eventManager = new EventManager(["foo", "bar"]);
    eventManager.register("foo", listener1);
    eventManager.register("bar", listener2);
    eventManager.fireEvent("foo");

    expect(listener1).toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
});

test("when firing an event then invoke listener with same parameters", () => {
    const listener = jest.fn();

    const eventManager = new EventManager(["test"]);
    eventManager.register("test", listener);
    eventManager.fireEvent("test", "param1", "param2");

    expect(listener).toHaveBeenCalledWith("param1", "param2");
});

test("when the listener throws an error then it is captured", () => {
    const listener = jest.fn().mockImplementation(() => {
        throw new Error("BOOM");
    });

    const eventManager = new EventManager(["test"]);
    eventManager.register("test", listener);
    eventManager.fireEvent("test");
});

test("when registering a listener and the event type is not supported then do nothing", () => {
    const eventManager = new EventManager(["test"]);
    eventManager.register("foo", jest.fn());

    expect(Object.keys(eventManager.listeners)).toHaveLength(0);
});

test("when registering a null then unregister the previous listener", () => {
    const eventManager = new EventManager(["test"]);
    eventManager.register("test", jest.fn());
    expect(eventManager.listeners["test"]).toBeDefined();
    eventManager.register("test", null);
    expect(eventManager.listeners["test"]).toBeUndefined();
});
