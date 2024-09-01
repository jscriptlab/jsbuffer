#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#ifndef JSB_C_SCHEMA_MESSAGE_H
#define JSB_C_SCHEMA_MESSAGE_H

#include "c_schema/Command.h"
#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct c_schema_Message {
    struct c_schema_Command command;
};
enum jsb_result_t c_schema_Message_decode(struct jsb_deserializer_t*, struct c_schema_Message*);
enum jsb_result_t c_schema_Message_encode(const struct c_schema_Message*, struct jsb_serializer_t*);
#endif // JSB_C_SCHEMA_MESSAGE_H

#ifdef __cplusplus
}
#endif // __cplusplus
