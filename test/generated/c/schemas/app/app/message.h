#ifndef JSB_APP_MESSAGE_H
#define JSB_APP_MESSAGE_H

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include "app/command_trait.h"
#include "app/deep_optional.h"
#include <jsb/jsb.h>
#include <string.h>

#include <jsb/deserializer.h>
#include <jsb/serializer.h>
#include <stdbool.h>

struct app_message_command_optional_t {
  jsb_uint8_t has_value;
  struct app_command_trait_t value;
};

struct app_message_command_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_command_optional_t value;
};

struct app_message_command_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_command_optional_optional_t value;
};

struct app_message_command_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_command_optional_optional_optional_t value;
};

struct app_message_int_optional_t {
  jsb_uint8_t has_value;
  jsb_int32_t value;
};

struct app_message_int_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int_optional_t value;
};

struct app_message_int_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int_optional_optional_t value;
};

struct app_message_int_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int_optional_optional_optional_t value;
};

struct app_message_int16_optional_t {
  jsb_uint8_t has_value;
  jsb_int16_t value;
};

struct app_message_int16_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int16_optional_t value;
};

struct app_message_int16_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int16_optional_optional_t value;
};

struct app_message_int16_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int16_optional_optional_optional_t value;
};

struct app_message_int8_optional_t {
  jsb_uint8_t has_value;
  jsb_int8_t value;
};

struct app_message_int8_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int8_optional_t value;
};

struct app_message_int8_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int8_optional_optional_t value;
};

struct app_message_int8_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int8_optional_optional_optional_t value;
};

struct app_message_int32_optional_t {
  jsb_uint8_t has_value;
  jsb_int32_t value;
};

struct app_message_int32_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int32_optional_t value;
};

struct app_message_int32_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int32_optional_optional_t value;
};

struct app_message_int32_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_int32_optional_optional_optional_t value;
};

struct app_message_uint8_optional_t {
  jsb_uint8_t has_value;
  jsb_uint8_t value;
};

struct app_message_uint8_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint8_optional_t value;
};

struct app_message_uint8_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint8_optional_optional_t value;
};

struct app_message_uint8_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint8_optional_optional_optional_t value;
};

struct app_message_uint16_optional_t {
  jsb_uint8_t has_value;
  jsb_uint16_t value;
};

struct app_message_uint16_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint16_optional_t value;
};

struct app_message_uint16_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint16_optional_optional_t value;
};

struct app_message_uint16_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint16_optional_optional_optional_t value;
};

struct app_message_uint32_optional_t {
  jsb_uint8_t has_value;
  jsb_uint32_t value;
};

struct app_message_uint32_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint32_optional_t value;
};

struct app_message_uint32_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint32_optional_optional_t value;
};

struct app_message_uint32_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_uint32_optional_optional_optional_t value;
};

struct app_message_string_optional_t {
  jsb_uint8_t has_value;
  jsb_string_t value;
};

struct app_message_string_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_string_optional_t value;
};

struct app_message_string_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_string_optional_optional_t value;
};

struct app_message_string_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_string_optional_optional_optional_t value;
};

struct app_message_deepoptional_optional_t {
  jsb_uint8_t has_value;
  struct app_deep_optional_t value;
};

struct app_message_deepoptional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_deepoptional_optional_t value;
};

struct app_message_deepoptional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_deepoptional_optional_optional_t value;
};

struct app_message_deepoptional_optional_optional_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_message_deepoptional_optional_optional_optional_t value;
};

struct app_message_t {
  struct app_command_trait_t command;
  struct app_message_command_optional_t command1;
  struct app_message_command_optional_optional_t command2;
  struct app_message_command_optional_optional_optional_t command3;
  struct app_message_command_optional_optional_optional_optional_t command4;
  struct app_message_int_optional_optional_optional_optional_t value1;
  struct app_message_int16_optional_optional_optional_optional_t value2;
  struct app_message_int8_optional_optional_optional_optional_t value3;
  struct app_message_int32_optional_optional_optional_optional_t value4;
  struct app_message_uint8_optional_optional_optional_optional_t value5;
  struct app_message_uint16_optional_optional_optional_optional_t value6;
  struct app_message_uint32_optional_optional_optional_optional_t value7;
  struct app_message_string_optional_optional_optional_optional_t value8;
  struct app_message_int_optional_t value9;
  struct app_message_int16_optional_t value10;
  struct app_message_int8_optional_t value11;
  struct app_message_int32_optional_t value12;
  struct app_message_uint8_optional_t value13;
  struct app_message_uint16_optional_t value14;
  struct app_message_uint32_optional_t value15;
  struct app_message_string_optional_t value16;
  struct app_message_deepoptional_optional_optional_optional_optional_t value17;
};
enum jsb_result_t app_message_decode(struct jsb_deserializer_t*,
                                     struct app_message_t*);
enum jsb_result_t app_message_encode(const struct app_message_t*,
                                     struct jsb_serializer_t*);
enum jsb_result_t app_message_init(struct app_message_t*);
void app_message_free(struct app_message_t*);
/**
 *@brief Initialize the optional value on command1 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] command1 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t
app_message_command1_init(struct app_message_t* message,
                          const struct app_command_trait_t* command1);

/**
 *@brief Initialize the optional value on command2 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] command2 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t
app_message_command2_init(struct app_message_t* message,
                          const struct app_command_trait_t* command2);

/**
 *@brief Initialize the optional value on command3 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] command3 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t
app_message_command3_init(struct app_message_t* message,
                          const struct app_command_trait_t* command3);

/**
 *@brief Initialize the optional value on command4 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] command4 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t
app_message_command4_init(struct app_message_t* message,
                          const struct app_command_trait_t* command4);

/**
 *@brief Initialize the optional value on value1 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value1 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value1_init(struct app_message_t* message,
                                          const jsb_int32_t* value1);

/**
 *@brief Initialize the optional value on value2 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value2 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value2_init(struct app_message_t* message,
                                          const jsb_int16_t* value2);

/**
 *@brief Initialize the optional value on value3 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value3 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value3_init(struct app_message_t* message,
                                          const jsb_int8_t* value3);

/**
 *@brief Initialize the optional value on value4 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value4 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value4_init(struct app_message_t* message,
                                          const jsb_int32_t* value4);

/**
 *@brief Initialize the optional value on value5 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value5 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value5_init(struct app_message_t* message,
                                          const jsb_uint8_t* value5);

/**
 *@brief Initialize the optional value on value6 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value6 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value6_init(struct app_message_t* message,
                                          const jsb_uint16_t* value6);

/**
 *@brief Initialize the optional value on value7 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value7 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value7_init(struct app_message_t* message,
                                          const jsb_uint32_t* value7);

/**
 *@brief Initialize the optional value on value8 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value8 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value8_init(struct app_message_t* message,
                                          const jsb_string_t* value8);

/**
 *@brief Initialize the optional value on value9 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value9 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value9_init(struct app_message_t* message,
                                          const jsb_int32_t* value9);

/**
 *@brief Initialize the optional value on value10 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value10 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value10_init(struct app_message_t* message,
                                           const jsb_int16_t* value10);

/**
 *@brief Initialize the optional value on value11 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value11 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value11_init(struct app_message_t* message,
                                           const jsb_int8_t* value11);

/**
 *@brief Initialize the optional value on value12 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value12 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value12_init(struct app_message_t* message,
                                           const jsb_int32_t* value12);

/**
 *@brief Initialize the optional value on value13 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value13 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value13_init(struct app_message_t* message,
                                           const jsb_uint8_t* value13);

/**
 *@brief Initialize the optional value on value14 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value14 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value14_init(struct app_message_t* message,
                                           const jsb_uint16_t* value14);

/**
 *@brief Initialize the optional value on value15 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value15 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value15_init(struct app_message_t* message,
                                           const jsb_uint32_t* value15);

/**
 *@brief Initialize the optional value on value16 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value16 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_message_value16_init(struct app_message_t* message,
                                           const jsb_string_t* value16);

/**
 *@brief Initialize the optional value on value17 parameter of struct
 *app_message_t
 *@param[in] message The struct to set the property on
 *@param[in] value17 The optional value to initialize. Pass NULL to unset the
 *optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t
app_message_value17_init(struct app_message_t* message,
                         const struct app_deep_optional_t* value17);

#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_APP_MESSAGE_H
