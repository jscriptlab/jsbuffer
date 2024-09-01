#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#ifndef JSB_C_SCHEMA_COMMAND_H
#define JSB_C_SCHEMA_COMMAND_H

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct c_schema_Command {
    jsb_uint32_t id;
    bool is_valid;
};
enum jsb_result_t c_schema_Command_decode(struct jsb_deserializer_t*, struct c_schema_Command*);
enum jsb_result_t c_schema_Command_encode(const struct c_schema_Command*, struct jsb_serializer_t*);
#endif // JSB_C_SCHEMA_COMMAND_H

#ifdef __cplusplus
}
#endif // __cplusplus
