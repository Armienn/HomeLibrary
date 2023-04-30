import {
	afterPatch,
	ButtonItem,
	definePlugin,
	DialogButton,
	Focusable,
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
import logones from "../assets/logo-nes.png"
import logosmd from "../assets/logo-smd.png"
import logosnes from "../assets/logo-snes.png"
import logops1 from "../assets/logo-ps1.png"
import logon64 from "../assets/logo-n64.png"
import logops2 from "../assets/logo-ps2.png"
import logongc from "../assets/logo-ngc.png"
import logowii from "../assets/logo-wii.png"
import logowiiu from "../assets/logo-wiiu.png"
import logogb from "../assets/logo-gb.png"
import logogba from "../assets/logo-gba.png"
import logonds from "../assets/logo-nds.png"

const collectionLinks = [
	{ text: "NES", path: "/library/collection/srm-TkVT", image: logones },
	{ text: "Sega Mega Drive", path: "/library/collection/uc-hqEr1PPqjGGL", image: logosmd },
	{ text: "SNES", path: "/library/collection/srm-U05FUw%3D%3D", image: logosnes },
	{ text: "PS1", path: "/library/collection/srm-UFMx", image: logops1 },
	{ text: "N64", path: "/library/collection/srm-TjY0", image: logon64 },
	{ text: "PS2", path: "/library/collection/uc-BtDYxNuz%2BZgC", image: logops2 },
	{ text: "GameCube", path: "/library/collection/srm-R2FtZWN1YmU%3D", image: logongc },
	{ text: "Wii", path: "/library/collection/uc-9bbNEkE7pSoC", image: logowii },
	{ text: "Wii U", path: "/library/collection/uc-hLRsA3PBLFdM", image: logowiiu },
	{ text: "GameBoy", path: "/library/collection/srm-R2FtZUJveQ%3D%3D", image: logogb },
	{ text: "GameBoy Advance", path: "/library/collection/srm-R2FtZUJveSBBZHZhbmNl", image: logogba },
	{ text: "DS", path: "/library/collection/uc-druyfZ1ughbL", image: logonds },
]

const imageSize = "15em"

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
		return ret
	afterPatch(tabbedContent.children.type, "type", patchThree)
	return ret
}

function patchThree(_: any, ret: any) {
	const tab = ret?.props?.tabs?.[0]
	if (!tab || hasBeenPatched(tab.content.type))
		return ret
	afterPatch(tab.content, "type", patchFour)
	return ret
}

function hasBeenPatched(object: any) {
	return !!object.__deckyOrig // I think this might disappear some day, so another solution should probably be found
}

function patchFour(_: any, ret: any) {
	const elements: any[] = ret.props.children
	const links = collectionLinks.map(x =>
		<Focusable onActivate={() => Router.Navigate(x.path)} style={{ height: imageSize }}>
			<img src={x.image} title={x.text} style={{ height: imageSize }} />
		</Focusable>
	)
	if (elements[0].props.id === "armienn-home-library")
		elements.shift()
	elements.unshift(
		<Focusable flow-children="right" style={{ display: "flex", gap: "1em", width: "97.2vw", overflowX: "hidden", scrollPadding: "2.8vw" }}>
			{links}
		</Focusable>
	)
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
