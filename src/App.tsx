import "./App.css";
import { RouterProvider, Outlet } from "react-router";
import { createHashRouter } from "react-router";
import { HomePage, LoginPage } from "./pages/Home.tsx";
import { RegisterPage } from "./pages/Register.tsx";
import { ChannelsPage } from "./pages/Channels.tsx";
import { UsersPage } from "./pages/Users.tsx";
import Chat from "./pages/Chat.tsx";
import { DMPage } from "./pages/DM.tsx";

function Layout() {
	return (
		<div className="app-container">
			<main className="main-content">
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
			{ path: "users", element: <UsersPage /> },
			{ path: "chat/:channelId", element: <Chat /> },
			{ path: "dm/:username", element: <DMPage /> }
		]
	}
])

function App() {
	return <RouterProvider router={router} />
}

export default App
