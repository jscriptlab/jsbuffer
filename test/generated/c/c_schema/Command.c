#include "c_schema/Command.h"

enum jsb_result_t c_schema_Command_decode(struct jsb_deserializer_t* d, struct c_schema_Command* result) {
    {
        jsb_int32_t header;
        JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
        if(header != -1703375325) {
            return JSB_INVALID_CRC_HEADER;
        }
    }
    JSB_CHECK_ERROR(jsb_deserializer_read_uint32(d, &result->id));
    {
        jsb_uint8_t value;
        JSB_CHECK_ERROR(jsb_deserializer_read_uint8(d, &value));
        if(value != 1 && value != 0) return JSB_INVALID_DECODED_VALUE;
        result->is_valid = value == 1 ? true : false;
    }
    return JSB_OK;
}

enum jsb_result_t c_schema_Command_encode(const struct c_schema_Command* input, struct jsb_serializer_t* s) {
    JSB_CHECK_ERROR(jsb_serializer_write_int32(s, -1703375325));
    JSB_CHECK_ERROR(jsb_serializer_write_uint32(s, input->id));
    JSB_CHECK_ERROR(jsb_serializer_write_uint8(s, input->is_valid ? 1 : 0));
    return JSB_OK;
}
