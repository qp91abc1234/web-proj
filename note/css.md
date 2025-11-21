#### 组件样式位置
组件样式若与布局有关，应写在组件外，方便查看与调整

#### 文本截断
单行截断五要素
```css
.truncate-single {
  width: 100%;              /* 1. 宽度限制 */
  overflow: hidden;         /* 2. 隐藏溢出 */
  text-overflow: ellipsis;  /* 3. 显示省略号 */
  white-space: nowrap;      /* 4. 不换行 */
  /* display: block/inline-block (隐含) */
}
```

多行截断四要素
```css
.truncate-multiple {
  display: -webkit-box;          /* 1. WebKit 盒子模型 */
  -webkit-box-orient: vertical;  /* 2. 垂直排列 */
  -webkit-line-clamp: 2;         /* 3. 显示行数 */
  overflow: hidden;              /* 4. 隐藏溢出 */
}
```
