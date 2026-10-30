import type { Component } from 'vue';
/**
 * 名称 → 组件表（02 §4.2 / §4.3 的地基）。
 *
 * 为什么是**显式表**而不是从导出里推导：`OJ.create('oj-table-grid-picker')` 与
 * `<div data-oj="table-grid-picker">` 里的字符串是**公开契约**，写错一个字母就是运行时报
 * "找不到组件"。推导出来的名字一旦因为重构改了组件变量名就静默变化，而这层映射是给
 * 没有 TS 的 jQuery 用户用的——他们拿不到任何编译期提示。
 *
 * 键统一带 `oj-` 前缀；`resolveOjComponent` 同时接受不带前缀的简写（PRD 的 `data-oj="ribbon"`
 * 就是这么写的），两种写法在文档里都出现，不能只认一种。
 */
export declare const OJ_COMPONENTS: Readonly<Record<string, Component>>;
export declare function resolveOjComponent(name: string): Component | undefined;
/** 给文档与 web-types 生成用：稳定排序，避免每次构建产出不同的 diff */
export declare function ojComponentNames(): string[];
