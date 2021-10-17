This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

Using TypeScript with React
React provides various types which we can use to describe our components properly.

Function Components
interface Props {...}

const Paragraph: React.FunctionComponent<Props> = ({children}) =>

  <p>{children}</p>
 
// FC is an alias for the FunctionComponent type
const Paragraph2: React.FC<Props> = ({children}) =>
  <p>{children}</p>

Class Components
interface Props {...}
interface State {...}

class SomeComponent extends React.Component<Props, State> {
constructor(props: Props) {
super(props);
this.state = ...
}
}

// OR

class SomeComponent extends React.PureComponent<Props, State> {}

Any React Component
When you'd like to assign both function and class components to a variable or a prop you can use the React.ComponentType interface to describe the variable.

interface Props {}

let anyComponent: React.ComponentType<Props> = //...some component with props matching the Props interface

Both React.FunctionComponent and React.Component already describe the built-in props like children.

DOM Events
const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {...}

const Button = () => <button onClick={clickHandler}>I am a button</button>

const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {...}

const Form = () => <form onSubmit={submitHandler}>...</form>

If React doesn't have an event type for some event at the moment (e.g. the event is still in experimental mode), we can use the React.SyntheticEvent type to describe it like this:

const inputHandler = (e: React.SyntheticEvent) => {
e.target...
}

const Form = () => (

  <form onSubmit={inputHandler}>
    <input type="text" onInput={inputHandler} />
  </form>
)

Other common event interfaces:

ChangeEvent
FocusEvent
FormEvent
FocusEvent
KeyboardEvent
MouseEvent
TouchEvent
DragEvent
PointerEvent
AnimationEvent
TransitionEvent
ClipboardEvent
SyntheticEvent

Creating a HOC
/_ 1. Defining the HOC _/

interface CurrentUserHOCProps {
currentUser: {
name: string;
};
}

const withCurrentUser = <ChildCompProps extends CurrentUserHOCProps>(
ChildComp: React.ComponentType<ChildCompProps>
) => {
const CurrentUserHOC = (
props: Omit<ChildCompProps, keyof CurrentUserHOCProps>
) => {
// Get the current user somewhere.
const currentUser = { name: 'John' };

    return (
      <ChildComp {...(props as ChildCompProps)} currentUser={currentUser} />
    );

};

return CurrentUserHOC;
};

/_ 2. Defining the child component which uses the props from the HOC _/

interface GreetingProps extends CurrentUserHOCProps {
color: 'yellow' | 'green';
}

const Greeting: React.FC<GreetingProps> = ({ color, currentUser }) => {
return <div style={‌{ color }}>{`Hello, ${currentUser.name}`}</div>;
};

const GreetingWithCurrentUser = withCurrentUser(Greeting);

/_ 3. Rendering the wrapped child component _/

const Header = () => {
return (
<header>
SomeLogo
<GreetingWithCurrentUser color="green" />
</header>
);
};
