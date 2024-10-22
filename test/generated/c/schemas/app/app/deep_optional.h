#ifndef JSB_APP_DEEP_OPTIONAL_H
#define JSB_APP_DEEP_OPTIONAL_H


#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

#include <string.h>
#include <jsb/jsb.h>

#include <stdbool.h>
#include <jsb/serializer.h>
#include <jsb/deserializer.h>

struct app_deep_optional_string_optional_t {
  jsb_uint8_t has_value;
  jsb_string_t value;
};

struct app_deep_optional_int_optional_t {
  jsb_uint8_t has_value;
  jsb_int32_t value;
};

struct app_deep_optional_int_optional_optional_t {
  jsb_uint8_t has_value;
  struct app_deep_optional_int_optional_t value;
};

struct app_deep_optional_t {
  struct app_deep_optional_string_optional_t value;
  struct app_deep_optional_int_optional_optional_t value2;
};
enum jsb_result_t app_deep_optional_decode(struct jsb_deserializer_t*, struct app_deep_optional_t*);
enum jsb_result_t app_deep_optional_encode(const struct app_deep_optional_t*, struct jsb_serializer_t*);
enum jsb_result_t app_deep_optional_init(struct app_deep_optional_t*);
void app_deep_optional_free(struct app_deep_optional_t*);
/**
 *@brief Initialize the optional value on value parameter of struct app_deep_optional_t
 *@param[in] deep_optional The struct to set the property on
 *@param[in] value The optional value to initialize. Pass NULL to unset the optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_deep_optional_value_init(struct app_deep_optional_t* deep_optional, const jsb_string_t* value);

/**
 *@brief Initialize the optional value on value2 parameter of struct app_deep_optional_t
 *@param[in] deep_optional The struct to set the property on
 *@param[in] value2 The optional value to initialize. Pass NULL to unset the optional value
 *@return JSB_OK on success, otherwise an `enum jsb_result_t` code
 */
enum jsb_result_t app_deep_optional_value2_init(struct app_deep_optional_t* deep_optional, const jsb_int32_t* value2);

#ifdef __cplusplus
}
#endif // __cplusplus

#endif // JSB_APP_DEEP_OPTIONAL_H
