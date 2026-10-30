const mockSubscribe = jest.fn((_id: string) => Promise.resolve({}));
const mockUnsubscribe = jest.fn((_id: string) => Promise.resolve({}));
jest.mock("../commands", () => ({
  subscribePresence: (id: string) => mockSubscribe(id),
  unsubscribePresence: (id: string) => mockUnsubscribe(id),
}));

import useSocketStore from "@/src/store/useSocketStore";
import { acquirePresence, releasePresence } from "../presenceRegistry";

describe("presence registry", () => {
  beforeEach(() => {
    mockSubscribe.mockClear();
    mockUnsubscribe.mockClear();
    useSocketStore.getState().setConnected(true);
    useSocketStore.getState().setConnected(false); // resets ref counts
    useSocketStore.getState().setConnected(true);
  });

  it("unsubscribes only when the last holder releases", () => {
    void acquirePresence("c1");
    void acquirePresence("c1");
    releasePresence("c1");
    expect(mockUnsubscribe).not.toHaveBeenCalled();
    releasePresence("c1");
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("does not unsubscribe a release that predates a disconnect", () => {
    void acquirePresence("c1");
    useSocketStore.getState().setConnected(false);
    useSocketStore.getState().setConnected(true);
    releasePresence("c1");
    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });

  it("a stale release cannot cancel a subscription re-acquired after reconnect", () => {
    void acquirePresence("c1");
    useSocketStore.getState().setConnected(false);
    useSocketStore.getState().setConnected(true);
    void acquirePresence("c1"); // new screen after reconnect
    releasePresence("c1"); // old screen cleanup
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1); // only the new holder's own release counts
    releasePresence("c1"); // nothing left to release
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
