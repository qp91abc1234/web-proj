#### 泛型
##### 泛型函数
function func<T extends string, U extends number>(a: T, b: U) {}

##### 泛型参数列表
`<T extends string, U extends number> `

```js
<
    T // 泛型参数
         extends string, // 泛型约束
    U
         extends number
> 
```

##### 泛型约束
`U extends number`
让泛型参数只能是基于右边扩展的类型

##### Parameters<T>
T必须是函数类型
Parameters 用于获取函数类型的参数类型

##### ReturnType<T>
T必须是函数类型
ReturnType 用于获取函数类型的返回类型

#### 映射类型
```ts
type Status = "success" | "error" | "pending"; // 联合类型
type Test = {
    [K in Status]: string;
};

// => 等价于

type Test = {
    success: string;
    error: string; 
    pending: string;
};
```