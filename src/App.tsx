import "./App.css";
import { RouterProvider, Outlet } from "react-router";
import { createHashRouter } from "react-router";
import { HomePage, RegisterPage } from "./pages/Home.tsx";

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
			{ path: "register", element: <RegisterPage /> }
		]
	}
])

function App() {
	return <RouterProvider router={router} />
}

export default App
