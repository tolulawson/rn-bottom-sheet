#include <jni.h>
#include "rnbottomsheetOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::rnbottomsheet::initialize(vm);
}
