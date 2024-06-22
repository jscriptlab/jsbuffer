cmake_minimum_required(VERSION 3.10)
project(jsb_c C)

add_library(jsb_c SHARED serializer.c
        serializer.c
        serializer.h
        jsb.h)