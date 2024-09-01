#include "c_schema/Message.h"

enum jsb_result_t c_schema_Message_decode(struct jsb_deserializer_t* d, struct c_schema_Message* result) {
    {
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != 203420205) {
            return JSB_INVALID_CRC_HEADER;
        }
    }
    JSB_CHECK_ERROR(c_schema_Command_decode(d, &result->command));
    return JSB_OK;
}

enum jsb_result_t c_schema_Message_encode(const struct c_schema_Message* input, struct jsb_serializer_t* s) {
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, 203420205));
    JSB_CHECK_ERROR(c_schema_Command_encode(&input->command, s));
    return JSB_OK;
}
