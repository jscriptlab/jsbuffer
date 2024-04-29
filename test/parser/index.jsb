import "./schema_internal_test/internal.jsb";
import { Event } from "./Event.jsb";

type Message {
  ulong id;
  vector<Event> event;
}

type AcknowledgeMessage {
  ulong id;
}
