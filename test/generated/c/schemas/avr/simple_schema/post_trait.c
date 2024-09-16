#include "simple_schema/post_trait.h"

enum jsb_result_t
simple_schema_post_trait_encode(const struct simple_schema_post_trait_t* input,
                                struct jsb_serializer_t* s) {
  switch (input->type) {
  case SIMPLE_SCHEMA_POST_ACTIVE_TYPE:
    JSB_TRACE("simple_schema_post_trait_encode/simple_schema.Post",
              "Encoding simple_schema.PostActive...");
    JSB_CHECK_ERROR(simple_schema_post_active_encode(
        &input->value.simple_schema_post_active, s));
    break;
  case SIMPLE_SCHEMA_POST_DELETED_TYPE:
    JSB_TRACE("simple_schema_post_trait_encode/simple_schema.Post",
              "Encoding simple_schema.PostDeleted...");
    JSB_CHECK_ERROR(simple_schema_post_deleted_encode(
        &input->value.simple_schema_post_deleted, s));
    break;
  default:
    JSB_TRACE("simple_schema_post_trait_encode/simple_schema.Post",
              "Invalid type: %d. Maybe you've forgot to initialize `struct "
              "simple_schema_post_trait_t`?\n",
              input->type);
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t
simple_schema_post_trait_decode(struct jsb_deserializer_t* d,
                                struct simple_schema_post_trait_t* output) {
  if (d == NULL) {
    JSB_TRACE("simple_schema_post_trait_decode",
              "Failed to decode simple_schema.Post, received NULL pointer for "
              "the deserializer parameter.");
    return JSB_BAD_ARGUMENT;
  }
  if (output == NULL) {
    JSB_TRACE("simple_schema_post_trait_decode",
              "Failed to decode simple_schema.Post, received NULL pointer for "
              "the output parameter.");
    return JSB_BAD_ARGUMENT;
  }
  jsb_int32_t header;
  JSB_CHECK_ERROR(jsb_deserializer_read_int32(d, &header));
  JSB_CHECK_ERROR(jsb_deserializer_rewind(d, 4));
  switch (header) {
  case -968397368:
    JSB_TRACE("simple_schema_post_trait_decode/simple_schema.Post",
              "Decoding simple_schema.PostActive...");
    JSB_CHECK_ERROR(simple_schema_post_active_decode(
        d, &output->value.simple_schema_post_active));
    break;
  case 1154524640:
    JSB_TRACE("simple_schema_post_trait_decode/simple_schema.Post",
              "Decoding simple_schema.PostDeleted...");
    JSB_CHECK_ERROR(simple_schema_post_deleted_decode(
        d, &output->value.simple_schema_post_deleted));
    break;
  default:
    JSB_TRACE("simple_schema.Post/decode",
              "Invalid decoded header: %d. Maybe you are decoding an "
              "incompatible or corrupted buffer?\n",
              header);
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

enum jsb_result_t
simple_schema_post_trait_init(struct simple_schema_post_trait_t* input,
                              enum simple_schema_post_type_t type) {
  if (input == NULL) {
    JSB_TRACE("simple_schema_post_trait_init",
              "Failed to initialize simple_schema.Post, received NULL pointer "
              "for the input parameter.");
    return JSB_BAD_ARGUMENT;
  }
  // Apply zeroes on every byte of the union
  jsb_memset(&input->value, 0, sizeof(union simple_schema_post_trait_value_t));
  switch (type) {
  case SIMPLE_SCHEMA_POST_ACTIVE_TYPE:
    JSB_TRACE(
        "simple_schema_post_trait_init",
        "Initializing with the given header (%d): simple_schema.PostActive...",
        type);
    input->type = SIMPLE_SCHEMA_POST_ACTIVE_TYPE;
    return simple_schema_post_active_init(
        &input->value.simple_schema_post_active);
  case SIMPLE_SCHEMA_POST_DELETED_TYPE:
    JSB_TRACE(
        "simple_schema_post_trait_init",
        "Initializing with the given header (%d): simple_schema.PostDeleted...",
        type);
    input->type = SIMPLE_SCHEMA_POST_DELETED_TYPE;
    return simple_schema_post_deleted_init(
        &input->value.simple_schema_post_deleted);
  default:
    JSB_TRACE(
        "simple_schema.Post/initialize",
        "Invalid type: %d. Maybe you are initializing with an invalid header?.",
        type);
    return JSB_INVALID_CRC_HEADER;
  }
  return JSB_OK;
}

void simple_schema_post_trait_free(struct simple_schema_post_trait_t* trait) {
  if (trait == NULL) {
    JSB_TRACE("simple_schema_post_trait_free",
              "Failed to free 'simple_schema.Post', received NULL pointer.");
    return;
  }
  JSB_TRACE("simple_schema_post_trait_free",
            "Freeing trait: simple_schema.Post.");
  switch (trait->type) {
  case SIMPLE_SCHEMA_POST_ACTIVE_TYPE:
    JSB_TRACE("simple_schema_post_trait_free",
              "Identified simple_schema.Post trait to have its value as: "
              "simple_schema.PostActive.");
    simple_schema_post_active_free(&trait->value.simple_schema_post_active);
    break;
  case SIMPLE_SCHEMA_POST_DELETED_TYPE:
    JSB_TRACE("simple_schema_post_trait_free",
              "Identified simple_schema.Post trait to have its value as: "
              "simple_schema.PostDeleted.");
    simple_schema_post_deleted_free(&trait->value.simple_schema_post_deleted);
    break;
  default:
    JSB_TRACE("simple_schema.Post/free",
              "Invalid type: %d. Maybe you are freeing an uninitialized or "
              "corrupted buffer?\n",
              trait->type);
    break;
  }
}
