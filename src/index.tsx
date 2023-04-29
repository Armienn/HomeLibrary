import {
	afterPatch,
	ButtonItem,
	definePlugin,
	DialogButton,
	Menu,
	MenuItem,
	PanelSection,
	PanelSectionRow,
	Router,
	ServerAPI,
	showContextMenu,
	staticClasses
} from "decky-frontend-lib"
import { VFC } from "react"
import { FaShip } from "react-icons/fa"

import logo from "../assets/logo.png"

const collectionLinks = [
	{ text: "NES", path: "/library/collection/srm-TkVT" },
	{ text: "SNES", path: "/library/collection/srm-U05FUw%3D%3D" },
	{ text: "N64", path: "/library/collection/srm-TjY0" },
	{ text: "GameBoy", path: "/library/collection/srm-R2FtZUJveQ%3D%3D" },
]

// interface AddMethodArgs {
//   left: number
//   right: number
// }

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
	// const [result, setResult] = useState<number | undefined>()

	// const onClick = async () => {
	//   const result = await serverAPI.callPluginMethod<AddMethodArgs, number>(
	//     "add",
	//     {
	//       left: 2,
	//       right: 2,
	//     }
	//   )
	//   if (result.success) {
	//     setResult(result.result)
	//   }
	// }

	return (
		<PanelSection title="Panel Section">
			<PanelSectionRow>
				<ButtonItem
					layout="below"
					onClick={(e: any) =>
						showContextMenu(
							<Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => { }}>
								<MenuItem onSelected={() => { }}>Item #1</MenuItem>
								<MenuItem onSelected={() => { }}>Item #2</MenuItem>
								<MenuItem onSelected={() => { }}>Item #3</MenuItem>
							</Menu>,
							e.currentTarget ?? window
						)
					}
				>
					Server says yolo
				</ButtonItem>
			</PanelSectionRow>

			<PanelSectionRow>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<img src={logo} />
				</div>
			</PanelSectionRow>

			<PanelSectionRow>
				<ButtonItem
					layout="below"
					onClick={() => {
						Router.CloseSideMenus()
						Router.Navigate("/decky-plugin-test")
					}}
				>
					Router
				</ButtonItem>
			</PanelSectionRow>
		</PanelSection>
	)
}

const DeckyPluginRouterTest: VFC = () => {
	return (
		<div style={{ marginTop: "50px", color: "white" }}>
			Hello World!
			<DialogButton onClick={() => Router.NavigateToLibraryTab()}>
				Go to Library
			</DialogButton>
		</div>
	)
}

const HomePatch = async (props: any) => {
	afterPatch(props.children, "type", patchOne)
}

function patchOne(_: any, ret: any) {
	afterPatch(ret.type, "type", patchTwo)
	return ret
}

function patchTwo(_: any, ret: any) {
	const tabbedContent = ret.props?.children?.props?.children?.props?.children?.props?.children?.[1]?.props
	if (!tabbedContent)
		return
	afterPatch(tabbedContent.children.type, "type", patchThree)
	return ret
}

function patchThree(_: any, ret: any) {
	const tab = ret.props?.tabs?.[0]
	if (!tab)
		return
	afterPatch(tab.content, "type", patchFour)
	return ret
}

function patchFour(_: any, ret: any) {
	const elements: any[] = ret.props.children
	const links = collectionLinks.map(x =>
		<DialogButton onClick={() => Router.Navigate(x.path)}>
			{x.text}
		</DialogButton>
	)
	if (elements[0].props.id === "armienn-home-library")
		elements.shift()
	elements.unshift(
		<div id="armienn-home-library">{links}</div>
	)
	console.log("updated:")
	console.log(ret)
	return ret
}

export default definePlugin((serverApi: ServerAPI) => {
	serverApi.routerHook.addRoute("/decky-plugin-test", DeckyPluginRouterTest, {
		exact: true,
	})

	const myPatch = serverApi.routerHook.addPatch('/library/home', x => { HomePatch(x); return x })

	return {
		title: <div className={staticClasses.Title}>Home Library</div>,
		content: <Content serverAPI={serverApi} />,
		icon: <FaShip />,
		onDismount() {
			serverApi.routerHook.removeRoute("/decky-plugin-test")
			serverApi.routerHook.removePatch('/library/home', myPatch)
		},
	}
})
