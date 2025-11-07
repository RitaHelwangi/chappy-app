import "./App.css";
import { RouterProvider, Outlet } from "react-router";
import { createHashRouter } from "react-router";
import { HomePage, LoginPage, RegisterPage } from "./pages/Home.tsx";
import { ChannelsPage } from "./pages/Channels.tsx";
import Chat from "./pages/Chat.tsx";

function Layout() {
	return (
		<div className="app-container">
			<header>
				<h1>Chappy</h1>
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	)
}

const router = createHashRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "login", element: <LoginPage /> },
			{ path: "register", element: <RegisterPage /> },
			{ path: "channels", element: <ChannelsPage /> },
			{ path: "chat/:channelId", element: <Chat /> }
		]
	}
])

function App() {
	return <RouterProvider router={router} />
}

export default App
