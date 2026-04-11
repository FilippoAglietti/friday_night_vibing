import type {
  Curriculum,
  Module,
  Lesson,
  QuizQuestion,
  BonusResource,
} from "@/types/curriculum";

// ---------------------------------------------------------------------------
// Day 1 — TypeScript Foundations & Advanced Types
// ---------------------------------------------------------------------------

const day1Lessons: Lesson[] = [
  {
    id: "ts-l1-1",
    title: "The Type System Deep Dive",
    description:
      "Move beyond basic annotations and understand how TypeScript's structural type system actually works under the hood.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Explain structural vs nominal typing and why TypeScript chose structural typing",
      "Use discriminated unions and exhaustive checks to model domain logic safely",
    ],
    keyPoints: [
      "TypeScript uses structural (duck) typing — shape matters, not name",
      "Discriminated unions + `never` in switch defaults guarantee exhaustive handling",
      "The `satisfies` operator validates a value matches a type without widening it",
      "`as const` creates the narrowest literal type, essential for config objects",
    ],
    content: `## Structural Typing — Why Shape Beats Name

Most languages you've used (Java, C#, Swift) are **nominal** — two types with identical fields are still different if their names differ. TypeScript flips that: if two types share the same shape, they are assignable to each other.

\`\`\`typescript
interface Dog { name: string; bark(): void }
interface Pet { name: string; bark(): void }

const rex: Dog = { name: "Rex", bark() { console.log("Woof!") } };
const myPet: Pet = rex; // Perfectly fine — same shape
\`\`\`

This is powerful when composing third-party libraries — you never need adapter classes just because two packages defined their own \`User\` type.

### Discriminated Unions for Domain Modeling

When your data has multiple variants, use a shared **discriminant property** and let the compiler narrow for you:

\`\`\`typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":    return Math.PI * s.radius ** 2;
    case "rect":      return s.width * s.height;
    case "triangle":  return 0.5 * s.base * s.height;
    default: {
      const _exhaustive: never = s;
      return _exhaustive; // compile error if a variant is missing
    }
  }
}
\`\`\`

### \`satisfies\` — Validate Without Widening

Introduced in TypeScript 4.9, \`satisfies\` lets you check that a value conforms to a type while keeping its **literal type** intact:

\`\`\`typescript
const palette = {
  red: "#ff0000",
  green: [0, 255, 0],
} satisfies Record<string, string | number[]>;

// palette.red is still string (not string | number[])
palette.red.toUpperCase(); // works!
\`\`\`

> **Pro tip:** Combine \`as const satisfies\` for config objects that are both validated and narrowly typed.
`,
    suggestedResources: [
      {
        title: "TypeScript Handbook — Narrowing",
        url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
        type: "article",
      },
      {
        title: "Matt Pocock — Satisfies Operator Explained",
        url: "https://www.totaltypescript.com/clarification-on-the-satisfies-operator",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l1-2",
    title: "Generics, Constraints & Inference",
    description:
      "Master generic functions, constrained type parameters, and TypeScript's powerful type inference to write reusable yet type-safe abstractions.",
    format: "interactive",
    durationMinutes: 80,
    order: 1,
    objectives: [
      "Write generic functions with meaningful constraints using `extends`",
      "Leverage inference so callers rarely need to pass explicit type arguments",
    ],
    keyPoints: [
      "Generics let you capture a relationship between inputs and outputs",
      "Use `extends` constraints to restrict what a generic accepts while keeping it flexible",
      "TypeScript infers generics from call-site arguments — explicit annotation is rarely needed",
      "The `infer` keyword inside conditional types lets you extract nested types",
      "Avoid over-generification — if a generic has only one usage, a concrete type is clearer",
    ],
    content: `## From Concrete to Generic

Start with a concrete function, then generalize only when you see duplication:

\`\`\`typescript
// Concrete
function firstString(arr: string[]): string | undefined {
  return arr[0];
}

// Generic — works for any array type
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);   // n: number | undefined
const s = first(["a", "b"]);  // s: string | undefined
\`\`\`

TypeScript **infers** \`T\` from the argument — callers never write \`first<number>(...)\`.

### Constraining Generics

Use \`extends\` to require certain properties:

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Ada", age: 36 };
getProperty(user, "name");  // string
getProperty(user, "email"); // Error: "email" is not in keyof typeof user
\`\`\`

### Inference with \`infer\`

Conditional types can **extract** types from other types:

\`\`\`typescript
type ReturnOf<F> = F extends (...args: any[]) => infer R ? R : never;

type X = ReturnOf<typeof Math.random>; // number
\`\`\`

This is how built-in utility types like \`ReturnType<T>\` and \`Parameters<T>\` work internally.

### A Real-World Pattern: Type-Safe Event Emitter

\`\`\`typescript
type EventMap = {
  login:  { userId: string };
  logout: { reason: string };
};

function emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
  // ...
}

emit("login", { userId: "abc" }); // OK
emit("login", { reason: "x" });   // Error — wrong payload shape
\`\`\`

> **Pro tip:** If your generic signature has more than three type parameters, step back — you're probably fighting the type system instead of using it.
`,
    suggestedResources: [
      {
        title: "TypeScript Handbook — Generics",
        url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l1-3",
    title: "Utility Types & Mapped Types Workshop",
    description:
      "Build your own utility types from scratch and learn to transform object types with mapped types, template literal types, and recursive types.",
    format: "project",
    durationMinutes: 80,
    order: 2,
    objectives: [
      "Implement custom utility types like DeepPartial, DeepReadonly, and StrictOmit",
      "Use mapped types and template literal types to generate typed API contracts",
    ],
    keyPoints: [
      "Mapped types iterate over keys with `[K in keyof T]` to transform each property",
      "Template literal types generate string unions like `on${Capitalize<EventName>}`",
      "Recursive conditional types enable deep transformations (DeepPartial, DeepReadonly)",
      "The `-readonly` and `-?` modifiers remove readonly or optional from mapped types",
    ],
    content: `## Mapped Types — Type-Level Map

A mapped type iterates over every key of an existing type and produces a new one:

\`\`\`typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

// Built-in Partial<T> is exactly this!
\`\`\`

You can add or remove modifiers:

\`\`\`typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type Required<T> = {
  [K in keyof T]-?: T[K];
};
\`\`\`

### Template Literal Types

Combine string literal unions at the type level:

\`\`\`typescript
type Event = "click" | "focus" | "blur";
type Handler = \`on\${Capitalize<Event>}\`;
// "onClick" | "onFocus" | "onBlur"
\`\`\`

This is perfect for generating typed prop names from event lists or API route strings.

### Workshop: Build DeepPartial

\`\`\`typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>
    : T[K];
};

interface Config {
  db: { host: string; port: number; ssl: { enabled: boolean } };
  cache: { ttl: number };
}

// Every nested field is now optional
type PartialConfig = DeepPartial<Config>;
\`\`\`

### Workshop: Type-Safe Route Params

\`\`\`typescript
type ExtractParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractParams<Rest>
    : T extends \`\${string}:\${infer Param}\`
      ? Param
      : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"
\`\`\`

> **Pro tip:** Test your utility types with \`type _test = Expect<Equal<YourType, Expected>>\` using the \`type-testing\` package. Type-level TDD catches regressions before runtime.
`,
    suggestedResources: [
      {
        title: "TypeScript Handbook — Mapped Types",
        url: "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html",
        type: "article",
      },
      {
        title: "Type Challenges — Practice Utility Types",
        url: "https://github.com/type-challenges/type-challenges",
        type: "tool",
      },
    ],
  },
];

const day1Quiz: QuizQuestion[] = [
  {
    id: "ts-q1-1",
    type: "multiple-choice",
    question:
      "What does the following TypeScript code produce?\n\n```typescript\nconst config = { port: 3000, host: \"localhost\" } as const;\ntype Port = typeof config.port;\n```",
    options: ["number", "3000", "string", "readonly number"],
    correctAnswer: "3000",
    explanation:
      "`as const` creates the narrowest literal type. `typeof config.port` is the literal type `3000`, not the wider `number`.",
    points: 10,
  },
  {
    id: "ts-q1-2",
    type: "multiple-choice",
    question:
      "Which utility type makes all properties of `T` required and non-nullable?",
    options: [
      "Partial<T>",
      "Required<T>",
      "NonNullable<T>",
      "Required<NonNullable<T>>",
    ],
    correctAnswer: "Required<T>",
    explanation:
      "`Required<T>` removes the `?` optional modifier from every property, making them all required. `NonNullable<T>` operates on a union type, not on object properties.",
    points: 10,
  },
  {
    id: "ts-q1-3",
    type: "multiple-choice",
    question:
      "In TypeScript's structural type system, when can type `A` be assigned to type `B`?",
    options: [
      "Only when A and B have the same name",
      "When A has at least all the properties of B with compatible types",
      "Only when A extends B explicitly",
      "When A and B are declared in the same file",
    ],
    correctAnswer:
      "When A has at least all the properties of B with compatible types",
    explanation:
      "TypeScript uses structural typing: assignment compatibility is determined by the shape (properties and their types), not by explicit inheritance or naming.",
    points: 10,
  },
];

const day1: Module = {
  id: "ts-m1",
  title: "Day 1: TypeScript Foundations & Advanced Types",
  description:
    "Deep dive into TypeScript's type system — structural typing, generics, conditional types, mapped types, and utility types. By the end of this day you will think in types.",
  objectives: [
    "Master TypeScript's structural type system and advanced narrowing techniques",
    "Build reusable, type-safe abstractions with generics and mapped types",
    "Create custom utility types for real-world domain modeling",
  ],
  lessons: day1Lessons,
  quiz: day1Quiz,
  order: 0,
  durationMinutes: 240,
};

// ---------------------------------------------------------------------------
// Day 2 — React with TypeScript
// ---------------------------------------------------------------------------

const day2Lessons: Lesson[] = [
  {
    id: "ts-l2-1",
    title: "Typed Components & Props Patterns",
    description:
      "Write React components with precise TypeScript types — discriminated union props, polymorphic components, and the render props pattern fully typed.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Type React components using function declarations with generic props",
      "Implement discriminated union props for components with multiple visual variants",
    ],
    keyPoints: [
      "Prefer `interface` for props — it gives better error messages and is extendable",
      "Use discriminated unions for variant props instead of boolean flags",
      "The `ComponentPropsWithoutRef<'button'>` type lets you forward native HTML props",
      "Generic components preserve caller-side type inference (e.g., typed `<Select<User>>` )",
    ],
    content: `## Props Done Right

Stop scattering \`any\` through your React code. Start every component with a clear props interface:

\`\`\`typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant, size = "md", isLoading, children, onClick }: ButtonProps) {
  return (
    <button
      className={\`btn btn--\${variant} btn--\${size}\`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
\`\`\`

### Discriminated Union Props

Some components behave differently based on a prop. Don't use booleans — use discriminated unions:

\`\`\`typescript
type AlertProps =
  | { severity: "info" | "warning"; message: string; onDismiss?: () => void }
  | { severity: "error"; message: string; errorCode: number; onRetry: () => void };

function Alert(props: AlertProps) {
  if (props.severity === "error") {
    // TypeScript knows errorCode and onRetry exist here
    return <div>Error {props.errorCode}: {props.message}</div>;
  }
  return <div>{props.message}</div>;
}
\`\`\`

### Polymorphic \`as\` Prop

Build a component that renders as different HTML elements while keeping type safety:

\`\`\`typescript
type BoxProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;

function Box<T extends React.ElementType = "div">({ as, ...props }: BoxProps<T>) {
  const Component = as || "div";
  return <Component {...props} />;
}

// Usage — href is type-checked because as="a"
<Box as="a" href="/about">About</Box>
\`\`\`

> **Pro tip:** Never use \`React.FC\` — it used to implicitly include \`children\` and doesn't support generics well. Use plain function declarations instead.
`,
    suggestedResources: [
      {
        title: "React TypeScript Cheatsheet",
        url: "https://react-typescript-cheatsheet.netlify.app/",
        type: "cheatsheet",
      },
      {
        title: "React Docs — TypeScript",
        url: "https://react.dev/learn/typescript",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l2-2",
    title: "Typed Hooks & Context Patterns",
    description:
      "Build custom hooks with proper generic signatures and create type-safe React Context that eliminates undefined checks at the call site.",
    format: "interactive",
    durationMinutes: 80,
    order: 1,
    objectives: [
      "Create custom hooks that return properly typed tuples and objects",
      "Implement a type-safe Context pattern that throws at the right level instead of returning undefined",
    ],
    keyPoints: [
      "Custom hooks should return `as const` tuples to preserve positional types",
      "Use a factory function for Context to avoid the `| undefined` default pitfall",
      "Generic hooks like `useLocalStorage<T>` preserve the stored value type through serialize/deserialize",
      "The `useReducer` hook benefits enormously from discriminated union actions",
    ],
    content: `## Custom Hooks with Precise Return Types

When your hook returns a tuple, use \`as const\` so callers get positional types:

\`\`\`typescript
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }] as const;
  // Returns: readonly [boolean, { toggle: () => void; ... }]
}

const [isOpen, { toggle }] = useToggle();
\`\`\`

### Type-Safe Context Factory

The biggest pain with React Context is the \`undefined\` default. Fix it once with a factory:

\`\`\`typescript
function createSafeContext<T>(displayName: string) {
  const Context = createContext<T | undefined>(undefined);
  Context.displayName = displayName;

  function useContext_() {
    const ctx = useContext(Context);
    if (ctx === undefined) {
      throw new Error(\`use\${displayName} must be used within \${displayName}Provider\`);
    }
    return ctx;
  }

  return [Context.Provider, useContext_] as const;
}

// Usage
interface AuthContext { user: User; logout: () => void }
const [AuthProvider, useAuth] = createSafeContext<AuthContext>("Auth");

// In components — no undefined check needed!
const { user } = useAuth();
\`\`\`

### Generic \`useLocalStorage\` Hook

\`\`\`typescript
function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
\`\`\`

> **Pro tip:** Pair \`useReducer\` with a discriminated union action type for complex state. The compiler enforces that every action carries exactly the payload it needs.
`,
    suggestedResources: [
      {
        title: "React Docs — Reusing Logic with Custom Hooks",
        url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l2-3",
    title: "Type-Safe Forms & Server State",
    description:
      "Integrate React Hook Form with Zod for fully validated, type-safe forms and connect them to TanStack Query for server state management.",
    format: "project",
    durationMinutes: 80,
    order: 2,
    objectives: [
      "Build forms where the schema, validation, and TypeScript types are a single source of truth",
      "Use TanStack Query with typed API functions for end-to-end type safety from server to UI",
    ],
    keyPoints: [
      "Zod schemas double as runtime validators AND TypeScript types via `z.infer<typeof schema>`",
      "React Hook Form's `zodResolver` connects the schema to form validation seamlessly",
      "TanStack Query's generics propagate the return type from the fetch function to the component",
      "Separating API functions into a typed layer eliminates `any` at the network boundary",
      "Form error types are inferred from the schema — no manual error typing needed",
    ],
    content: `## Single Source of Truth: Zod + React Hook Form

Define your schema once and derive everything from it:

\`\`\`typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["admin", "user", "viewer"]),
});

// Derive the TypeScript type — always in sync
type SignupData = z.infer<typeof signupSchema>;

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupData) => {
    // data is fully typed and validated
    console.log(data.email, data.role);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* errors are typed — errors.email exists, errors.foo does not */}
    </form>
  );
}
\`\`\`

### Typed Server State with TanStack Query

\`\`\`typescript
// api/users.ts — typed API layer
async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// In component
function UserList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // users is User[] | undefined — fully typed from fetchUsers return type
  return users?.map((u) => <div key={u.id}>{u.name}</div>);
}
\`\`\`

> **Pro tip:** Create a generic \`typedFetch<T>\` wrapper that validates the response with a Zod schema at runtime. This catches backend contract changes before they reach your UI.
`,
    suggestedResources: [
      {
        title: "React Hook Form — TypeScript Support",
        url: "https://react-hook-form.com/ts",
        type: "article",
      },
      {
        title: "TanStack Query Docs",
        url: "https://tanstack.com/query/latest/docs/react/overview",
        type: "article",
      },
    ],
  },
];

const day2Quiz: QuizQuestion[] = [
  {
    id: "ts-q2-1",
    type: "multiple-choice",
    question:
      "What is the recommended way to type a React component's children prop in modern TypeScript?",
    options: [
      "children: JSX.Element",
      "children: React.ReactNode",
      "children: React.ReactChild",
      "children: string | JSX.Element",
    ],
    correctAnswer: "children: React.ReactNode",
    explanation:
      "`React.ReactNode` is the most permissive and correct type for children — it includes strings, numbers, elements, fragments, portals, null, and undefined. `JSX.Element` is too narrow and would reject strings or arrays.",
    points: 10,
  },
  {
    id: "ts-q2-2",
    type: "multiple-choice",
    question:
      "When using `z.infer<typeof schema>` with Zod, what does the resulting type represent?",
    options: [
      "The Zod schema object itself",
      "The input type before validation",
      "The output type after successful validation",
      "A union of the input and output types",
    ],
    correctAnswer: "The output type after successful validation",
    explanation:
      "`z.infer` extracts the output type — the shape of data after a successful `.parse()`. For schemas with `.transform()`, the output type may differ from the input.",
    points: 10,
  },
  {
    id: "ts-q2-3",
    type: "multiple-choice",
    question:
      "Why is `React.FC` generally discouraged in modern React + TypeScript codebases?",
    options: [
      "It causes runtime performance issues",
      "It does not support generics and historically included implicit children",
      "It is not compatible with React 18+",
      "It prevents server-side rendering",
    ],
    correctAnswer:
      "It does not support generics and historically included implicit children",
    explanation:
      "`React.FC` cannot express generic components (e.g., `<Select<T>>`) and before React 18 types it implicitly added a `children` prop even when the component didn't accept one.",
    points: 10,
  },
];

const day2: Module = {
  id: "ts-m2",
  title: "Day 2: React with TypeScript",
  description:
    "Build production-grade React components with precise types — typed props, hooks patterns, context factories, and fully type-safe forms with server state management.",
  objectives: [
    "Write React components with advanced prop typing patterns including polymorphism",
    "Build type-safe custom hooks and context factories",
    "Integrate Zod validation with React Hook Form for single-source-of-truth forms",
  ],
  lessons: day2Lessons,
  quiz: day2Quiz,
  order: 1,
  durationMinutes: 240,
};

// ---------------------------------------------------------------------------
// Day 3 — Server-Side with Node.js & Express
// ---------------------------------------------------------------------------

const day3Lessons: Lesson[] = [
  {
    id: "ts-l3-1",
    title: "Typed Express APIs from Scratch",
    description:
      "Set up an Express server with full TypeScript integration — typed request/response objects, route parameters, and middleware chains.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Configure a TypeScript + Express project with proper tsconfig settings for Node.js",
      "Type request handlers so that params, query, and body are validated at compile time",
    ],
    keyPoints: [
      "Use `@types/express` and extend `Request` with generics for typed params and body",
      "Set `moduleResolution: 'node16'` and `module: 'node16'` in tsconfig for modern Node.js",
      "Create a typed router factory that enforces handler signatures per HTTP method",
      "Use declaration merging to extend Express's `Request` interface for auth context",
    ],
    content: `## Express + TypeScript: The Right Way

Start with a proper project setup:

\`\`\`bash
npm init -y
npm i express zod
npm i -D typescript @types/express @types/node tsx
npx tsc --init
\`\`\`

### Typing Request Handlers

Express's \`Request\` is generic — use it:

\`\`\`typescript
import express, { Request, Response } from "express";

interface CreateUserBody {
  email: string;
  name: string;
  role: "admin" | "user";
}

interface UserParams {
  userId: string;
}

const app = express();
app.use(express.json());

app.post(
  "/users",
  (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    const { email, name, role } = req.body; // fully typed
    res.status(201).json({ id: crypto.randomUUID(), email, name, role });
  }
);

app.get(
  "/users/:userId",
  (req: Request<UserParams>, res: Response) => {
    const { userId } = req.params; // string, typed
    res.json({ userId });
  }
);
\`\`\`

### Declaration Merging for Auth

Add a \`user\` property to every request after authentication:

\`\`\`typescript
// types/express.d.ts
declare namespace Express {
  interface Request {
    user?: { id: string; role: "admin" | "user" };
  }
}

// Now req.user is available everywhere after your auth middleware runs
\`\`\`

### Typed Error Handler

\`\`\`typescript
interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.isOperational ? err.message : "Internal server error",
  });
});
\`\`\`

> **Pro tip:** Use \`tsx watch src/server.ts\` for development — it's faster than \`ts-node\` and supports modern TypeScript features out of the box.
`,
    suggestedResources: [
      {
        title: "Express.js Documentation",
        url: "https://expressjs.com/en/guide/routing.html",
        type: "article",
      },
      {
        title: "Node.js TypeScript Guide",
        url: "https://nodejs.org/en/learn/getting-started/nodejs-with-typescript",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l3-2",
    title: "Middleware Patterns & Type-Safe Pipelines",
    description:
      "Design composable middleware with TypeScript generics — authentication guards, validation layers, and rate limiters with full type propagation.",
    format: "interactive",
    durationMinutes: 80,
    order: 1,
    objectives: [
      "Build middleware that adds typed context to the request object and propagates it to downstream handlers",
      "Create a validation middleware using Zod that types the request body based on the schema",
    ],
    keyPoints: [
      "Middleware can narrow the `Request` type for downstream handlers using generics",
      "A Zod validation middleware transforms `req.body` from `unknown` to the validated type",
      "Chain middleware with `RequestHandler[]` arrays and let TypeScript verify the pipeline",
      "Use branded types for validated IDs to prevent mixing raw strings with validated ones",
    ],
    content: `## Validation Middleware with Zod

Create a reusable middleware that validates and types the request body in one step:

\`\`\`typescript
import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

function validate<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

// Usage
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  tags: z.array(z.string()).max(5).default([]),
  published: z.boolean().default(false),
});

type CreatePostInput = z.infer<typeof createPostSchema>;

app.post("/posts", validate(createPostSchema), (req, res) => {
  // req.body is validated at runtime — Zod rejects bad data before this runs
  const { title, content, tags, published } = req.body as CreatePostInput;
  res.status(201).json({ title, tags });
});
\`\`\`

### Authentication Guard Middleware

\`\`\`typescript
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = verifyToken(token); // returns { id: string; role: string }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// Composable pipeline
app.delete("/users/:id", requireAuth, requireRole("admin"), deleteUser);
\`\`\`

> **Pro tip:** Create a \`pipe\` utility that chains middleware and merges their type contributions — this gives you compile-time assurance that your middleware ordering is correct.
`,
    suggestedResources: [
      {
        title: "Zod Documentation",
        url: "https://zod.dev/",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l3-3",
    title: "Building a REST API: End-to-End Project",
    description:
      "Build a complete typed REST API with CRUD operations, error handling, pagination, and API documentation — all with TypeScript from the ground up.",
    format: "project",
    durationMinutes: 80,
    order: 2,
    objectives: [
      "Implement a full CRUD API with layered architecture (routes, controllers, services)",
      "Add typed pagination, filtering, and error responses following REST best practices",
    ],
    keyPoints: [
      "Layer your application: routes -> controllers -> services -> repositories",
      "Define shared response types (ApiResponse<T>, PaginatedResponse<T>) used across all endpoints",
      "Use TypeScript's `satisfies` to validate route definitions against an API schema",
      "Generate OpenAPI specs from your Zod schemas with `zod-to-openapi`",
      "Use `Result<T, E>` pattern instead of throwing for predictable error handling in services",
    ],
    content: `## Layered Architecture with Shared Types

Define your API response types once and reuse everywhere:

\`\`\`typescript
// types/api.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { timestamp: string; requestId: string };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}
\`\`\`

### Service Layer with Result Pattern

\`\`\`typescript
type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

class PostService {
  async create(input: CreatePostInput): Promise<Result<Post, "DUPLICATE_TITLE" | "DB_ERROR">> {
    const exists = await this.repo.findByTitle(input.title);
    if (exists) return { ok: false, error: "DUPLICATE_TITLE" };

    try {
      const post = await this.repo.create(input);
      return { ok: true, data: post };
    } catch {
      return { ok: false, error: "DB_ERROR" };
    }
  }
}
\`\`\`

### Controller That Maps Results to HTTP

\`\`\`typescript
async function createPost(req: Request, res: Response) {
  const result = await postService.create(req.body);

  if (!result.ok) {
    const statusMap = { DUPLICATE_TITLE: 409, DB_ERROR: 500 } as const;
    return res.status(statusMap[result.error]).json({
      success: false,
      error: { code: result.error, message: \`Failed: \${result.error}\` },
    });
  }

  res.status(201).json({ success: true, data: result.data });
}
\`\`\`

### Typed Pagination Helper

\`\`\`typescript
function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = items.length;
  const sliced = items.slice((page - 1) * pageSize, page * pageSize);
  return {
    success: true,
    data: sliced,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
\`\`\`

> **Pro tip:** Use \`zod-to-openapi\` to generate your API documentation directly from the same Zod schemas you use for validation — one source of truth for types, validation, and docs.
`,
    suggestedResources: [
      {
        title: "Express Best Practices — Error Handling",
        url: "https://expressjs.com/en/guide/error-handling.html",
        type: "article",
      },
      {
        title: "zod-to-openapi — Generate OpenAPI from Zod",
        url: "https://github.com/asteasolutions/zod-to-openapi",
        type: "tool",
      },
    ],
  },
];

const day3Quiz: QuizQuestion[] = [
  {
    id: "ts-q3-1",
    type: "multiple-choice",
    question:
      'What does `Request<{ userId: string }, {}, { name: string }>` type in Express?',
    options: [
      "A request with userId in the body and name in params",
      "A request with userId in params and name in the body",
      "A request with userId in the query and name in headers",
      "A request with userId in headers and name in the query",
    ],
    correctAnswer:
      "A request with userId in params and name in the body",
    explanation:
      "Express's `Request` generic parameters are ordered: `Request<Params, ResBody, ReqBody, Query>`. So the first generic is params and the third is the request body.",
    points: 10,
  },
  {
    id: "ts-q3-2",
    type: "multiple-choice",
    question:
      "What does `schema.safeParse(data)` return when validation fails?",
    options: [
      "It throws a ZodError",
      "It returns `{ success: false, error: ZodError }`",
      "It returns `undefined`",
      "It returns the original data unchanged",
    ],
    correctAnswer: "It returns `{ success: false, error: ZodError }`",
    explanation:
      "`.safeParse()` never throws — it returns a discriminated union: `{ success: true, data: T }` or `{ success: false, error: ZodError }`. Use `.parse()` if you want it to throw.",
    points: 10,
  },
];

const day3: Module = {
  id: "ts-m3",
  title: "Day 3: Server-Side with Node.js & Express",
  description:
    "Build typed Express APIs with Zod validation middleware, layered architecture, and the Result pattern for predictable error handling.",
  objectives: [
    "Set up and configure an Express + TypeScript server with proper project structure",
    "Build composable, type-safe middleware pipelines for validation and auth",
    "Implement a complete REST API with layered architecture and typed responses",
  ],
  lessons: day3Lessons,
  quiz: day3Quiz,
  order: 2,
  durationMinutes: 240,
};

// ---------------------------------------------------------------------------
// Day 4 — Database Layer with Prisma & Drizzle
// ---------------------------------------------------------------------------

const day4Lessons: Lesson[] = [
  {
    id: "ts-l4-1",
    title: "Prisma: Schema-First Type Safety",
    description:
      "Design your database schema with Prisma and get auto-generated TypeScript types, typed queries, and seamless migrations.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Define a Prisma schema with relations and generate fully typed client code",
      "Write type-safe queries using Prisma Client with includes, selects, and filters",
    ],
    keyPoints: [
      "Prisma generates TypeScript types from your schema — your DB layer is always in sync",
      "The `include` and `select` options change the return type at compile time",
      "Use `Prisma.UserCreateInput` for insert types and `Prisma.UserWhereInput` for filters",
      "Prisma's `$transaction` method preserves types across multi-query transactions",
    ],
    content: `## Schema-Driven Development

With Prisma, your database schema is the source of truth for TypeScript types:

\`\`\`prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  tags      Tag[]
}

enum Role { USER ADMIN }
\`\`\`

Run \`npx prisma generate\` and you get fully typed client methods:

\`\`\`typescript
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Return type is automatically: User & { posts: Post[] }
const userWithPosts = await prisma.user.findUnique({
  where: { email: "ada@example.com" },
  include: { posts: true },
});

// Select narrows the return type
const emailOnly = await prisma.user.findMany({
  select: { email: true, name: true },
});
// Type: { email: string; name: string }[]
\`\`\`

### Typed Create and Update

\`\`\`typescript
// Prisma.UserCreateInput is auto-generated from your schema
const newUser = await prisma.user.create({
  data: {
    email: "grace@example.com",
    name: "Grace Hopper",
    role: "ADMIN",
    posts: {
      create: [{ title: "First Post", content: "Hello, Prisma!" }],
    },
  },
  include: { posts: true },
});
\`\`\`

### Transactions

\`\`\`typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: "a@b.com", name: "A" } }),
  prisma.post.create({ data: { title: "P", content: "C", authorId: "..." } }),
]);
// Both user and post are fully typed
\`\`\`

> **Pro tip:** Use \`prisma db push\` for prototyping and \`prisma migrate dev\` for production migrations. Never mix the two in the same project.
`,
    suggestedResources: [
      {
        title: "Prisma Documentation — Getting Started",
        url: "https://www.prisma.io/docs/getting-started",
        type: "article",
      },
      {
        title: "Prisma Client API Reference",
        url: "https://www.prisma.io/docs/reference/api-reference/prisma-client-reference",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l4-2",
    title: "Drizzle: SQL-First Type Safety",
    description:
      "Explore Drizzle ORM's code-first approach — define your schema in TypeScript, write SQL-like queries, and get full type inference without code generation.",
    format: "interactive",
    durationMinutes: 80,
    order: 1,
    objectives: [
      "Define database tables and relations using Drizzle's TypeScript schema DSL",
      "Write type-safe queries using Drizzle's SQL-like query builder",
    ],
    keyPoints: [
      "Drizzle schemas are plain TypeScript — no code generation step needed",
      "Use `$inferSelect` and `$inferInsert` to extract types from table definitions",
      "Drizzle's query builder mirrors SQL syntax: `select().from().where().orderBy()`",
      "Relational queries with `db.query.users.findMany({ with: { posts: true } })` are fully typed",
      "Drizzle-kit handles migrations with `drizzle-kit generate` and `drizzle-kit migrate`",
    ],
    content: `## Code-First Schema Definition

Define your tables directly in TypeScript:

\`\`\`typescript
import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: boolean("published").default(false).notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
});

// Extract types — no generation needed
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
\`\`\`

### Relations

\`\`\`typescript
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
\`\`\`

### Type-Safe Queries

\`\`\`typescript
import { eq, and, like } from "drizzle-orm";

// SQL-style
const admins = await db
  .select()
  .from(users)
  .where(eq(users.role, "admin"))
  .orderBy(users.createdAt);

// Relational style (like Prisma's include)
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
  where: eq(users.role, "admin"),
});
// Type: (User & { posts: Post[] })[]
\`\`\`

> **Pro tip:** Drizzle's zero-generation approach makes it ideal for monorepos where you share schema types between server and client packages without a build step.
`,
    suggestedResources: [
      {
        title: "Drizzle ORM Documentation",
        url: "https://orm.drizzle.team/docs/overview",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l4-3",
    title: "Migrations, Relations & Performance",
    description:
      "Master database migrations, complex relations (many-to-many, self-referencing), and performance optimization patterns with both Prisma and Drizzle.",
    format: "project",
    durationMinutes: 80,
    order: 2,
    objectives: [
      "Implement many-to-many and self-referencing relations with proper join tables",
      "Optimize queries using select, pagination, and connection pooling",
    ],
    keyPoints: [
      "Many-to-many relations need an explicit join table — both Prisma and Drizzle support this",
      "Use cursor-based pagination for large datasets — it's more performant than offset-based",
      "Connection pooling (PgBouncer, Prisma Accelerate) is essential for serverless deployments",
      "Use `.explain()` to analyze query plans and add indexes where needed",
    ],
    content: `## Many-to-Many Relations

### Prisma

\`\`\`prisma
model Post {
  id   String @id @default(cuid())
  tags Tag[]
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}
\`\`\`

Prisma creates an implicit join table. Query with:

\`\`\`typescript
const postsWithTags = await prisma.post.findMany({
  include: { tags: { select: { name: true } } },
});
\`\`\`

### Drizzle (Explicit Join Table)

\`\`\`typescript
export const postsToTags = pgTable("posts_to_tags", {
  postId: text("post_id").notNull().references(() => posts.id),
  tagId: text("tag_id").notNull().references(() => tags.id),
}, (t) => ({ pk: primaryKey({ columns: [t.postId, t.tagId] }) }));
\`\`\`

### Cursor-Based Pagination

\`\`\`typescript
async function getPosts(cursor?: string, limit = 20) {
  const where = cursor ? { id: { gt: cursor } } : {};

  const posts = await prisma.post.findMany({
    where,
    take: limit + 1, // fetch one extra to know if there's a next page
    orderBy: { id: "asc" },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, -1) : posts;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}
\`\`\`

### Connection Pooling for Serverless

\`\`\`typescript
// In serverless (Vercel, AWS Lambda), reuse the client across invocations
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
\`\`\`

> **Pro tip:** Run \`EXPLAIN ANALYZE\` on slow queries and add composite indexes on columns you filter + sort together. A missing index is the #1 cause of slow TypeScript APIs.
`,
    suggestedResources: [
      {
        title: "Prisma — Relations",
        url: "https://www.prisma.io/docs/concepts/components/prisma-schema/relations",
        type: "article",
      },
      {
        title: "Drizzle ORM — Joins & Relations",
        url: "https://orm.drizzle.team/docs/rqb",
        type: "article",
      },
    ],
  },
];

const day4Quiz: QuizQuestion[] = [
  {
    id: "ts-q4-1",
    type: "multiple-choice",
    question:
      "How do you extract a TypeScript type from a Drizzle table definition?",
    options: [
      "Drizzle.infer<typeof users>",
      "typeof users.$inferSelect",
      "z.infer<typeof users>",
      "users.toType()",
    ],
    correctAnswer: "typeof users.$inferSelect",
    explanation:
      "Drizzle exposes `$inferSelect` for the select (read) type and `$inferInsert` for the insert (write) type directly on table definitions. No code generation is required.",
    points: 10,
  },
  {
    id: "ts-q4-2",
    type: "multiple-choice",
    question:
      "In Prisma, how does the `include` option affect the TypeScript return type?",
    options: [
      "It has no effect on the type — relations are always included",
      "It adds the included relation as a typed property on the return type",
      "It returns the data as `unknown` requiring manual casting",
      "It changes the return type to `any`",
    ],
    correctAnswer:
      "It adds the included relation as a typed property on the return type",
    explanation:
      "Prisma's type system is context-aware. When you `include: { posts: true }`, the return type automatically changes from `User` to `User & { posts: Post[] }`. This is one of Prisma's key features.",
    points: 10,
  },
  {
    id: "ts-q4-3",
    type: "multiple-choice",
    question:
      "Why is cursor-based pagination preferred over offset-based for large datasets?",
    options: [
      "It uses less memory on the client side",
      "It is required by the SQL standard",
      "It avoids scanning skipped rows, giving consistent O(1) performance regardless of page depth",
      "It is the only method that works with TypeScript",
    ],
    correctAnswer:
      "It avoids scanning skipped rows, giving consistent O(1) performance regardless of page depth",
    explanation:
      "Offset-based pagination (`OFFSET 10000`) must scan and discard 10,000 rows to reach the target page. Cursor-based pagination uses a WHERE clause on an indexed column, giving constant performance at any depth.",
    points: 10,
  },
];

const day4: Module = {
  id: "ts-m4",
  title: "Day 4: Database Layer with Prisma & Drizzle",
  description:
    "Compare and master the two leading TypeScript ORMs — Prisma's schema-first approach and Drizzle's code-first SQL builder — with migrations, relations, and performance tuning.",
  objectives: [
    "Build type-safe database layers with both Prisma and Drizzle ORM",
    "Implement complex relations, migrations, and query optimization patterns",
  ],
  lessons: day4Lessons,
  quiz: day4Quiz,
  order: 3,
  durationMinutes: 240,
};

// ---------------------------------------------------------------------------
// Day 5 — Authentication & Authorization
// ---------------------------------------------------------------------------

const day5Lessons: Lesson[] = [
  {
    id: "ts-l5-1",
    title: "JWT Authentication with TypeScript",
    description:
      "Implement stateless JWT authentication with typed payloads, refresh token rotation, and secure cookie handling.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Implement JWT sign/verify with typed payloads using jose or jsonwebtoken",
      "Build a refresh token rotation system with secure httpOnly cookies",
    ],
    keyPoints: [
      "Always type your JWT payload — `interface JWTPayload { sub: string; role: Role; iat: number }`",
      "Use `jose` over `jsonwebtoken` for Edge Runtime compatibility (Vercel Edge, Cloudflare Workers)",
      "Store access tokens in memory, refresh tokens in httpOnly secure cookies",
      "Implement token rotation: each refresh token is single-use and invalidated after exchange",
    ],
    content: `## Typed JWT Authentication

Never leave your JWT payload as \`any\`. Define it:

\`\`\`typescript
import { SignJWT, jwtVerify } from "jose";

interface TokenPayload {
  sub: string;       // user ID
  role: "admin" | "user";
  permissions: string[];
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}
\`\`\`

### Refresh Token Rotation

\`\`\`typescript
async function rotateTokens(refreshToken: string) {
  // 1. Verify the refresh token
  const payload = await verifyToken(refreshToken);

  // 2. Check if it's been used before (replay attack detection)
  const stored = await db.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.used) {
    // Token reuse detected — invalidate ALL tokens for this user
    await db.refreshToken.deleteMany({ where: { userId: payload.sub } });
    throw new Error("Token reuse detected");
  }

  // 3. Mark old token as used
  await db.refreshToken.update({
    where: { token: refreshToken },
    data: { used: true },
  });

  // 4. Issue new pair
  const newAccess = await signToken({ sub: payload.sub, role: payload.role, permissions: payload.permissions });
  const newRefresh = await signToken({ ...payload });

  await db.refreshToken.create({ data: { token: newRefresh, userId: payload.sub } });

  return { accessToken: newAccess, refreshToken: newRefresh };
}
\`\`\`

### Secure Cookie Configuration

\`\`\`typescript
res.cookie("refresh_token", newRefresh, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth/refresh",        // only sent to refresh endpoint
});
\`\`\`

> **Pro tip:** Use the \`jose\` library instead of \`jsonwebtoken\` — it works in Edge Runtimes, uses the Web Crypto API, and has better TypeScript support.
`,
    suggestedResources: [
      {
        title: "jose — JavaScript Object Signing and Encryption",
        url: "https://github.com/panva/jose",
        type: "tool",
      },
    ],
  },
  {
    id: "ts-l5-2",
    title: "OAuth2 & Third-Party Authentication",
    description:
      "Integrate OAuth2 providers (Google, GitHub) with typed callbacks, session management, and account linking using NextAuth.js / Auth.js.",
    format: "interactive",
    durationMinutes: 90,
    order: 1,
    objectives: [
      "Configure Auth.js with multiple OAuth2 providers and typed session callbacks",
      "Implement account linking so users can sign in with multiple providers",
    ],
    keyPoints: [
      "Auth.js provides typed session objects via module augmentation",
      "OAuth2 flow: redirect -> callback -> token exchange -> user info fetch",
      "Always extend the Session type to include role and other custom fields",
      "Account linking connects multiple OAuth identities to a single user record",
    ],
    content: `## Auth.js with Type-Safe Sessions

Extend the default session type to include your custom fields:

\`\`\`typescript
// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
    } & DefaultSession["user"];
  }
}
\`\`\`

### Auth.js Configuration

\`\`\`typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET }),
    Google({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add custom fields to session
      session.user.id = token.sub!;
      session.user.role = (token.role as "admin" | "user") ?? "user";
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // First sign-in: fetch role from DB
        const dbUser = await db.user.findUnique({ where: { email: user.email! } });
        token.role = dbUser?.role ?? "user";
      }
      return token;
    },
  },
});
\`\`\`

### Using the Typed Session

\`\`\`typescript
// Server Component (Next.js App Router)
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) redirect("/login");

  // session.user.role is typed as "admin" | "user"
  if (session.user.role === "admin") {
    return <AdminDashboard />;
  }

  return <UserDashboard user={session.user} />;
}
\`\`\`

> **Pro tip:** Always check your OAuth callback URLs match exactly between your provider dashboard and your app config. Mismatched redirect URIs are the #1 OAuth debugging headache.
`,
    suggestedResources: [
      {
        title: "Auth.js Documentation",
        url: "https://authjs.dev/getting-started",
        type: "article",
      },
      {
        title: "OAuth 2.0 Simplified",
        url: "https://www.oauth.com/",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l5-3",
    title: "Role-Based Access Control (RBAC) System",
    description:
      "Build a type-safe RBAC system with hierarchical roles, resource-level permissions, and middleware enforcement.",
    format: "project",
    durationMinutes: 70,
    order: 2,
    objectives: [
      "Design a typed permission system with roles, resources, and actions",
      "Implement RBAC middleware that checks permissions at the route level with compile-time safety",
    ],
    keyPoints: [
      "Define permissions as a typed map: `Record<Role, Record<Resource, Action[]>>`",
      "Use TypeScript's `satisfies` to validate your permission matrix at compile time",
      "Middleware should check permissions, not roles — roles are just permission bundles",
      "Use Zod enums for roles and permissions to validate at both compile time and runtime",
    ],
    content: `## Type-Safe Permission Matrix

Define your permissions as a strongly-typed constant:

\`\`\`typescript
const roles = ["admin", "editor", "viewer"] as const;
type Role = typeof roles[number];

const resources = ["posts", "users", "analytics"] as const;
type Resource = typeof resources[number];

const actions = ["create", "read", "update", "delete"] as const;
type Action = typeof actions[number];

type PermissionMatrix = Record<Role, Partial<Record<Resource, Action[]>>>;

const permissions = {
  admin: {
    posts: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    analytics: ["read"],
  },
  editor: {
    posts: ["create", "read", "update"],
    analytics: ["read"],
  },
  viewer: {
    posts: ["read"],
    analytics: ["read"],
  },
} satisfies PermissionMatrix;
\`\`\`

### Permission Check Utility

\`\`\`typescript
function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  return permissions[role]?.[resource]?.includes(action) ?? false;
}

// Type-safe — the compiler rejects invalid resources/actions
hasPermission("editor", "posts", "delete"); // false
hasPermission("admin", "posts", "delete");  // true
\`\`\`

### RBAC Middleware

\`\`\`typescript
function requirePermission(resource: Resource, action: Action) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (!hasPermission(user.role, resource, action)) {
      return res.status(403).json({
        error: \`Forbidden: \${user.role} cannot \${action} \${resource}\`,
      });
    }

    next();
  };
}

// Usage — readable and type-safe
app.post("/posts", requirePermission("posts", "create"), createPost);
app.delete("/posts/:id", requirePermission("posts", "delete"), deletePost);
\`\`\`

> **Pro tip:** Prefer checking permissions ("can this user create a post?") over checking roles ("is this user an admin?"). This makes your authorization logic resilient to role hierarchy changes.
`,
    suggestedResources: [
      {
        title: "OWASP Authorization Cheat Sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
        type: "article",
      },
    ],
  },
];

const day5Quiz: QuizQuestion[] = [
  {
    id: "ts-q5-1",
    type: "multiple-choice",
    question:
      "Where should refresh tokens be stored in a browser-based application?",
    options: [
      "In localStorage for easy access",
      "In a JavaScript variable (memory)",
      "In an httpOnly secure cookie with sameSite: strict",
      "In sessionStorage with encryption",
    ],
    correctAnswer: "In an httpOnly secure cookie with sameSite: strict",
    explanation:
      "httpOnly cookies cannot be accessed by JavaScript, preventing XSS attacks from stealing tokens. The secure flag ensures HTTPS-only transmission, and sameSite: strict prevents CSRF.",
    points: 10,
  },
  {
    id: "ts-q5-2",
    type: "multiple-choice",
    question:
      "What is the advantage of checking permissions instead of roles in authorization logic?",
    options: [
      "Permissions are faster to evaluate than roles",
      "It decouples authorization logic from role hierarchy changes",
      "Permissions use less memory than roles",
      "The TypeScript compiler requires permissions, not roles",
    ],
    correctAnswer:
      "It decouples authorization logic from role hierarchy changes",
    explanation:
      "When you check `canCreatePost` instead of `isAdmin`, adding a new role (like 'editor') with that permission requires zero code changes in your route handlers — only the permission matrix needs updating.",
    points: 10,
  },
  {
    id: "ts-q5-3",
    type: "multiple-choice",
    question:
      "What should happen when a refresh token is used more than once (replay detected)?",
    options: [
      "Return the same access token again",
      "Silently ignore the request",
      "Invalidate ALL refresh tokens for that user",
      "Log the event but allow the request",
    ],
    correctAnswer: "Invalidate ALL refresh tokens for that user",
    explanation:
      "Token reuse indicates a stolen token. The secure response is to invalidate the entire refresh token family for that user, forcing re-authentication. This is the standard refresh token rotation security pattern.",
    points: 10,
  },
];

const day5: Module = {
  id: "ts-m5",
  title: "Day 5: Authentication & Authorization",
  description:
    "Implement production-grade authentication with JWT, OAuth2, and type-safe role-based access control from scratch.",
  objectives: [
    "Build JWT authentication with typed payloads and refresh token rotation",
    "Integrate OAuth2 providers with typed sessions using Auth.js",
    "Design and implement a type-safe RBAC permission system",
  ],
  lessons: day5Lessons,
  quiz: day5Quiz,
  order: 4,
  durationMinutes: 240,
};

// ---------------------------------------------------------------------------
// Day 6 — Testing & CI/CD
// ---------------------------------------------------------------------------

const day6Lessons: Lesson[] = [
  {
    id: "ts-l6-1",
    title: "Unit Testing with Vitest & Type-Safe Mocks",
    description:
      "Write fast, type-safe unit tests with Vitest — mocking dependencies while preserving TypeScript's type checking.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Configure Vitest for a TypeScript project with path aliases and coverage",
      "Create type-safe mocks using `vi.fn()` and `vi.mock()` with proper generics",
    ],
    keyPoints: [
      "Vitest is API-compatible with Jest but 10-20x faster thanks to Vite's transform pipeline",
      "`vi.fn<Parameters, ReturnType>()` creates a typed mock that the compiler checks",
      "Use `vi.mock()` with factory functions for module-level mocking",
      "The `MockedFunction<typeof fn>` utility type gives you autocomplete on `.mockReturnValue()`",
      "Inline snapshots (`toMatchInlineSnapshot`) are self-documenting and diff-friendly",
    ],
    content: `## Vitest Setup

\`\`\`typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: { provider: "v8", reporter: ["text", "lcov"] },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
\`\`\`

### Type-Safe Mocking

\`\`\`typescript
import { describe, it, expect, vi, type MockedFunction } from "vitest";
import { createUser } from "@/services/user";
import { db } from "@/lib/db";

// Mock the entire module
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockCreate = db.user.create as MockedFunction<typeof db.user.create>;

describe("createUser", () => {
  it("creates a user with hashed password", async () => {
    const mockUser = { id: "1", email: "a@b.com", name: "Test" };
    mockCreate.mockResolvedValueOnce(mockUser);

    const result = await createUser({ email: "a@b.com", name: "Test", password: "secret" });

    expect(result).toEqual(mockUser);
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "a@b.com",
        password: expect.not.stringContaining("secret"), // hashed!
      }),
    });
  });

  it("throws on duplicate email", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Unique constraint failed"));

    await expect(
      createUser({ email: "dup@b.com", name: "Dup", password: "secret" })
    ).rejects.toThrow("Unique constraint");
  });
});
\`\`\`

### Testing Async Utilities

\`\`\`typescript
import { retry } from "@/lib/retry";

it("retries failed operations", async () => {
  const operation = vi.fn<[], string>()
    .mockRejectedValueOnce(new Error("fail"))
    .mockRejectedValueOnce(new Error("fail"))
    .mockResolvedValueOnce("success");

  const result = await retry(operation, { maxAttempts: 3 });

  expect(result).toBe("success");
  expect(operation).toHaveBeenCalledTimes(3);
});
\`\`\`

> **Pro tip:** Use \`vi.useFakeTimers()\` for testing debounced or time-dependent logic. Call \`vi.advanceTimersByTime(ms)\` to simulate time passing without actually waiting.
`,
    suggestedResources: [
      {
        title: "Vitest Documentation",
        url: "https://vitest.dev/guide/",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l6-2",
    title: "End-to-End Testing with Playwright",
    description:
      "Write resilient end-to-end tests with Playwright — page object models, typed fixtures, and visual regression testing.",
    format: "interactive",
    durationMinutes: 80,
    order: 1,
    objectives: [
      "Build a typed page object model for reusable test abstractions",
      "Write E2E tests covering critical user flows with Playwright's auto-waiting",
    ],
    keyPoints: [
      "Playwright auto-waits for elements — no manual `sleep()` or `waitFor()` needed",
      "Page Object Model encapsulates selectors and actions for maintainability",
      "Use `test.extend<Fixtures>()` to create typed custom fixtures for test setup",
      "Visual regression with `toHaveScreenshot()` catches unintended UI changes",
    ],
    content: `## Page Object Model — Typed

Encapsulate page interactions in typed classes:

\`\`\`typescript
// tests/pages/LoginPage.ts
import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
\`\`\`

### Typed Custom Fixtures

\`\`\`typescript
// tests/fixtures.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

interface AppFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
}

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  authenticatedPage: async ({ page }, use) => {
    // Setup: log in before each test that needs auth
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("test@example.com", "password");
    await use(page);
  },
});
\`\`\`

### Writing E2E Tests

\`\`\`typescript
import { test } from "./fixtures";
import { expect } from "@playwright/test";

test("user can sign in and see dashboard", async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login("admin@example.com", "secret123");

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("invalid credentials show error", async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login("wrong@example.com", "bad");

  await expect(loginPage.errorMessage).toHaveText("Invalid credentials");
});
\`\`\`

> **Pro tip:** Use Playwright's \`--ui\` mode during development (\`npx playwright test --ui\`) for a visual debugger that lets you step through tests and inspect the DOM at each point.
`,
    suggestedResources: [
      {
        title: "Playwright Documentation — Getting Started",
        url: "https://playwright.dev/docs/intro",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l6-3",
    title: "CI/CD Pipelines with GitHub Actions",
    description:
      "Build a production-grade CI/CD pipeline that runs type checking, tests, and deployment in parallel with proper caching and secrets management.",
    format: "project",
    durationMinutes: 60,
    order: 2,
    objectives: [
      "Configure a GitHub Actions pipeline with type checking, unit tests, E2E tests, and deployment stages",
      "Implement caching strategies for node_modules and Playwright browsers to speed up CI",
    ],
    keyPoints: [
      "Run `tsc --noEmit` as a separate CI step — it catches type errors that tests might miss",
      "Use `actions/cache` for node_modules and Playwright browser binaries",
      "Parallelize unit tests and E2E tests in separate jobs for faster feedback",
      "Use GitHub Actions environments and branch protection rules for deployment gates",
    ],
    content: `## Production CI/CD Pipeline

\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci
      - run: npx tsc --noEmit

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci
      - run: npx vitest run --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
\`\`\`

### Branch Protection Strategy

Configure GitHub branch protection rules:

- **Require status checks:** typecheck, unit-tests, e2e-tests
- **Require PR reviews:** at least 1 approval
- **Require up-to-date branches:** prevents merging stale PRs

### Deployment Stage

\`\`\`yaml
  deploy:
    needs: [typecheck, unit-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: npx vercel --prod --token=\${{ secrets.VERCEL_TOKEN }}
\`\`\`

### Type-Safe Environment Variables in CI

\`\`\`typescript
// src/env.ts — validates env vars at startup
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export const env = envSchema.parse(process.env);
\`\`\`

> **Pro tip:** Add \`npx tsc --noEmit\` as a pre-commit hook with Husky and lint-staged. Catching type errors before push saves CI minutes and keeps the feedback loop tight.
`,
    suggestedResources: [
      {
        title: "GitHub Actions Documentation",
        url: "https://docs.github.com/en/actions",
        type: "article",
      },
      {
        title: "Vitest Coverage Reporting",
        url: "https://vitest.dev/guide/coverage.html",
        type: "article",
      },
    ],
  },
];

const day6Quiz: QuizQuestion[] = [
  {
    id: "ts-q6-1",
    type: "multiple-choice",
    question:
      "What does `vi.fn<[], string>()` create in Vitest?",
    options: [
      "A mock function that takes no arguments and returns a string",
      "A mock function that takes a string argument and returns void",
      "A spy on an existing function",
      "A mock module that exports a string",
    ],
    correctAnswer:
      "A mock function that takes no arguments and returns a string",
    explanation:
      "`vi.fn<Parameters, ReturnType>()` creates a typed mock. `vi.fn<[], string>()` means zero parameters and a `string` return type, so `.mockReturnValue(123)` would be a type error.",
    points: 10,
  },
  {
    id: "ts-q6-2",
    type: "multiple-choice",
    question:
      "Why should `tsc --noEmit` be a separate CI step from running tests?",
    options: [
      "Tests cannot run without compiling first",
      "It catches type errors in code paths that tests may not exercise",
      "The TypeScript compiler is too slow to run during tests",
      "It generates coverage reports for type safety",
    ],
    correctAnswer:
      "It catches type errors in code paths that tests may not exercise",
    explanation:
      "Tests only exercise the code paths they cover. `tsc --noEmit` checks the ENTIRE codebase for type errors, including dead code, unused exports, and utility types — things tests might never touch.",
    points: 10,
  },
  {
    id: "ts-q6-3",
    type: "multiple-choice",
    question:
      "What is the main benefit of Playwright's auto-waiting mechanism?",
    options: [
      "It makes tests run faster by skipping timeouts",
      "It automatically waits for elements to be actionable before interacting, eliminating flaky sleep-based waits",
      "It retries failed tests automatically",
      "It parallelizes test execution across browsers",
    ],
    correctAnswer:
      "It automatically waits for elements to be actionable before interacting, eliminating flaky sleep-based waits",
    explanation:
      "Playwright automatically waits for elements to be visible, enabled, and stable before clicking or typing. This eliminates the need for manual `sleep()` calls, which are the #1 source of flaky E2E tests.",
    points: 10,
  },
];

const day6: Module = {
  id: "ts-m6",
  title: "Day 6: Testing & CI/CD",
  description:
    "Master testing TypeScript applications with Vitest and Playwright, then automate everything with GitHub Actions CI/CD pipelines.",
  objectives: [
    "Write type-safe unit tests with Vitest and mock dependencies without losing type checking",
    "Build E2E tests with Playwright using page objects and typed fixtures",
    "Configure a production-grade CI/CD pipeline with parallel jobs and caching",
  ],
  lessons: day6Lessons,
  quiz: day6Quiz,
  order: 5,
  durationMinutes: 220,
};

// ---------------------------------------------------------------------------
// Day 7 — Deployment & Production
// ---------------------------------------------------------------------------

const day7Lessons: Lesson[] = [
  {
    id: "ts-l7-1",
    title: "Docker & Containerized TypeScript Apps",
    description:
      "Build production-optimized Docker images for TypeScript applications with multi-stage builds, proper layer caching, and minimal image sizes.",
    format: "video",
    durationMinutes: 80,
    order: 0,
    objectives: [
      "Write multi-stage Dockerfiles that produce minimal production images for TypeScript apps",
      "Configure Docker Compose for local development with hot-reload and database services",
    ],
    keyPoints: [
      "Multi-stage builds: compile TypeScript in a build stage, copy only JS output to a slim runtime stage",
      "Use `node:20-alpine` as the runtime base image — it is ~50MB vs ~350MB for the full image",
      "Copy `package.json` and `package-lock.json` before source code to leverage Docker layer caching",
      "Run the container as a non-root user for security",
    ],
    content: `## Multi-Stage Dockerfile for TypeScript

\`\`\`dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Prune devDependencies
RUN npm prune --production

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system app && adduser --system --ingroup app app
USER app

COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`

### Docker Compose for Development

\`\`\`yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      target: deps  # Use deps stage for dev
    command: npx tsx watch src/server.ts
    volumes:
      - .:/app
      - /app/node_modules  # Don't override node_modules
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
\`\`\`

### Image Size Comparison

| Strategy | Image Size |
|----------|-----------|
| \`node:20\` + all deps | ~1.2 GB |
| \`node:20-alpine\` + all deps | ~350 MB |
| Multi-stage + prod deps only | ~85 MB |

> **Pro tip:** Add a \`.dockerignore\` file that excludes \`node_modules\`, \`.git\`, \`*.md\`, and test files. This dramatically speeds up the Docker build context transfer.
`,
    suggestedResources: [
      {
        title: "Docker — Multi-Stage Builds",
        url: "https://docs.docker.com/build/building/multi-stage/",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l7-2",
    title: "Deploying to Vercel & Edge Runtimes",
    description:
      "Deploy TypeScript applications to Vercel with edge functions, ISR, and environment-specific configurations.",
    format: "interactive",
    durationMinutes: 90,
    order: 1,
    objectives: [
      "Configure Vercel deployment with proper environment variables, build settings, and preview deployments",
      "Understand the differences between Node.js and Edge runtimes and choose the right one for each route",
    ],
    keyPoints: [
      "Edge Runtime has a smaller API surface — no `fs`, no native modules, but ~0ms cold starts",
      "Use `export const runtime = 'edge'` to opt specific routes into the Edge Runtime",
      "ISR (Incremental Static Regeneration) revalidates cached pages without full rebuilds",
      "Preview deployments give each PR its own URL for testing before merging",
      "Use `vercel env pull .env.local` to sync environment variables locally",
    ],
    content: `## Vercel Deployment Configuration

\`\`\`json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
\`\`\`

### Edge vs Node.js Runtime

\`\`\`typescript
// app/api/fast/route.ts — Edge Runtime (~0ms cold start)
export const runtime = "edge";

export async function GET(request: Request) {
  // Limited API: no fs, no native modules
  // But: globally distributed, near-instant cold starts
  const data = await fetch("https://api.example.com/data");
  return Response.json(await data.json());
}
\`\`\`

\`\`\`typescript
// app/api/heavy/route.ts — Node.js Runtime (full API)
export const runtime = "nodejs";

export async function POST(request: Request) {
  // Full Node.js API: fs, child_process, native modules
  // But: regional, ~250ms cold starts
  const { processImage } = await import("sharp");
  // ...
}
\`\`\`

### Incremental Static Regeneration

\`\`\`typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // revalidate every hour

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  return <article>{post?.content}</article>;
}

// On-demand revalidation from a webhook
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const { slug } = await req.json();
  revalidatePath(\`/blog/\${slug}\`);
  return Response.json({ revalidated: true });
}
\`\`\`

> **Pro tip:** Use Vercel's \`vercel dev\` locally to match production behavior exactly — it simulates Edge and Serverless runtimes locally, so you catch runtime-specific bugs before deploying.
`,
    suggestedResources: [
      {
        title: "Vercel Documentation — Deployments",
        url: "https://vercel.com/docs/deployments/overview",
        type: "article",
      },
      {
        title: "Next.js — Edge Runtime",
        url: "https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes",
        type: "article",
      },
    ],
  },
  {
    id: "ts-l7-3",
    title: "Monitoring, Error Tracking & Performance",
    description:
      "Set up production observability with Sentry for error tracking, structured logging, and performance monitoring with typed instrumentation.",
    format: "project",
    durationMinutes: 70,
    order: 2,
    objectives: [
      "Integrate Sentry for error tracking with source maps and typed error boundaries",
      "Implement structured logging and performance monitoring with custom metrics",
    ],
    keyPoints: [
      "Upload source maps to Sentry during CI so stack traces point to TypeScript, not compiled JS",
      "Use typed error boundaries in React to gracefully handle component crashes",
      "Structured logging (JSON format) enables filtering and alerting in production",
      "Track custom performance metrics (API response times, DB query durations) with typed instrumentation",
    ],
    content: `## Sentry Integration with TypeScript

\`\`\`typescript
// sentry.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
    }
    return event;
  },
});
\`\`\`

### Typed Error Boundary

\`\`\`typescript
"use client";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, () => this.setState({ error: null }));
    }
    return this.props.children;
  }
}
\`\`\`

### Structured Logging

\`\`\`typescript
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, meta?: Omit<LogEntry, "level" | "message" | "timestamp">) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  console[level](JSON.stringify(entry));
}

// Usage
log("info", "User signed in", { userId: "abc", duration: 42 });
// {"level":"info","message":"User signed in","timestamp":"...","userId":"abc","duration":42}
\`\`\`

> **Pro tip:** Set up Sentry's release tracking in your CI pipeline. Tag each deployment with a release version so you can see which deploy introduced a regression and auto-resolve issues that are fixed.
`,
    suggestedResources: [
      {
        title: "Sentry — Next.js Guide",
        url: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
        type: "article",
      },
      {
        title: "Vercel — Monitoring & Observability",
        url: "https://vercel.com/docs/observability",
        type: "article",
      },
    ],
  },
];

const day7Quiz: QuizQuestion[] = [
  {
    id: "ts-q7-1",
    type: "multiple-choice",
    question:
      "What is the primary benefit of multi-stage Docker builds for TypeScript apps?",
    options: [
      "They compile TypeScript faster",
      "They produce smaller images by excluding devDependencies, source files, and build tools from the final stage",
      "They enable hot-reload in production",
      "They are required by container orchestrators like Kubernetes",
    ],
    correctAnswer:
      "They produce smaller images by excluding devDependencies, source files, and build tools from the final stage",
    explanation:
      "Multi-stage builds let you use a full Node.js image with all dev tools for compilation, then copy only the compiled output and production dependencies to a slim Alpine image — reducing image size by 10-15x.",
    points: 10,
  },
  {
    id: "ts-q7-2",
    type: "multiple-choice",
    question:
      "When should you choose the Edge Runtime over the Node.js Runtime on Vercel?",
    options: [
      "When you need access to the filesystem and native modules",
      "When you need near-zero cold starts and your code uses only Web Standard APIs",
      "When your function runs for more than 30 seconds",
      "When you need to use Prisma with a database connection",
    ],
    correctAnswer:
      "When you need near-zero cold starts and your code uses only Web Standard APIs",
    explanation:
      "The Edge Runtime is globally distributed with ~0ms cold starts, but it only supports Web Standard APIs (fetch, crypto, etc.). If you need fs, native modules, or long-running processes, use the Node.js runtime.",
    points: 10,
  },
];

const day7: Module = {
  id: "ts-m7",
  title: "Day 7: Deployment & Production",
  description:
    "Take your TypeScript application from local development to production with Docker, Vercel deployment, monitoring, error tracking, and performance optimization.",
  objectives: [
    "Build optimized Docker images with multi-stage builds for TypeScript applications",
    "Deploy to Vercel with proper runtime selection, ISR, and environment configuration",
    "Set up production observability with error tracking, logging, and performance monitoring",
  ],
  lessons: day7Lessons,
  quiz: day7Quiz,
  order: 6,
  durationMinutes: 240,
};

// ---------------------------------------------------------------------------
// Bonus Resources
// ---------------------------------------------------------------------------

const bonusResources: BonusResource[] = [
  {
    id: "ts-br-1",
    title: "Total TypeScript — Free Tutorials by Matt Pocock",
    type: "video",
    url: "https://www.totaltypescript.com/tutorials",
    description:
      "Comprehensive video tutorials covering TypeScript from intermediate to advanced patterns, taught by one of the TypeScript community's most respected educators.",
    durationMinutes: 300,
    isFree: true,
  },
  {
    id: "ts-br-2",
    title: "TypeScript Playground — Experiment in the Browser",
    type: "tool",
    url: "https://www.typescriptlang.org/play",
    description:
      "The official TypeScript playground with live type checking, auto-complete, and shareable URLs. Perfect for testing type-level code and sharing snippets.",
    isFree: true,
  },
  {
    id: "ts-br-3",
    title: "TypeScript Error Translator",
    type: "tool",
    url: "https://ts-error-translator.vercel.app/",
    description:
      "Paste cryptic TypeScript error messages and get plain-English explanations. An essential tool when you're staring at a 10-line conditional type error.",
    isFree: true,
  },
  {
    id: "ts-br-4",
    title: "Effective TypeScript — 83 Specific Ways to Improve Your TypeScript",
    type: "book",
    url: "https://effectivetypescript.com/",
    description:
      "Dan Vanderkam's definitive guide to writing better TypeScript. Each item is a focused, actionable recommendation backed by real-world examples.",
    isFree: false,
  },
  {
    id: "ts-br-5",
    title: "TypeScript Cheat Sheet — Quick Reference",
    type: "cheatsheet",
    url: "https://www.typescriptlang.org/cheatsheets",
    description:
      "Official TypeScript cheat sheets covering types, interfaces, classes, control flow analysis, and more. Print-friendly and great for quick reference during development.",
    isFree: true,
  },
];

// ---------------------------------------------------------------------------
// Exported Course
// ---------------------------------------------------------------------------

export const tsCourse: Curriculum = {
  id: "ts-fullstack-bootcamp-2026",
  title: "Full-Stack TypeScript Bootcamp",
  subtitle:
    "7 intensive days from TypeScript fundamentals to production deployment",
  description:
    "An intensive 7-day bootcamp that takes experienced JavaScript developers from TypeScript fundamentals through full-stack application development to production deployment. Each day follows a bootcamp structure — morning theory sessions build the mental model, afternoon hands-on projects cement it. You will ship a complete, type-safe application by the end of the week.",
  targetAudience:
    "Developers with JavaScript experience looking to master TypeScript for full-stack development",
  difficulty: "advanced",
  objectives: [
    "Master TypeScript's advanced type system including generics, conditional types, and mapped types",
    "Build type-safe React applications with typed hooks, context, and form validation",
    "Design and implement typed REST APIs with Express, Zod validation, and layered architecture",
    "Work with type-safe database layers using Prisma and Drizzle ORM",
    "Implement production-grade authentication, authorization, and security patterns",
    "Deploy, test, and monitor TypeScript applications with CI/CD, Docker, and observability tools",
  ],
  prerequisites: [
    "Solid JavaScript fundamentals (ES6+)",
    "Basic understanding of HTTP and REST APIs",
    "Command-line familiarity",
  ],
  tags: ["TypeScript", "React", "Node.js", "Bootcamp", "Full-Stack"],
  modules: [day1, day2, day3, day4, day5, day6, day7],
  pacing: {
    style: "instructor-led",
    totalHours: 28,
    hoursPerWeek: 28,
    totalWeeks: 1,
    weeklyPlan: [
      {
        week: 1,
        label: "Intensive Bootcamp Week",
        moduleIds: [
          "ts-m1",
          "ts-m2",
          "ts-m3",
          "ts-m4",
          "ts-m5",
          "ts-m6",
          "ts-m7",
        ],
      },
    ],
  },
  bonusResources,
  createdBy: "Syllabi AI",
  createdAt: "2026-04-01T10:00:00Z",
  updatedAt: "2026-04-11T00:00:00Z",
  version: "1.0.0",
};
