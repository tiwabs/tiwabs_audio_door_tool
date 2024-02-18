import { ActionIcon, Group, Paper, Title } from "@mantine/core"
import { AiFillCloseCircle, AiFillMinusCircle } from "react-icons/ai"

function appQuit() {
	window.Main.sendMessage("appQuit")
}

function appMinimize() {
	window.Main.sendMessage("appMinimize")
}

export function Header() {
	return (
		<>
			<Paper
				sx={{
					WebkitAppRegion: "drag",
					width: 550,
					height: 30,
					backgroundColor: "rgb(50, 50, 50)"
				}}
			>
				<Group>
					<Title
						sx={{
							fontSize: "20px",
							fontWeight: 500,
							textShadow: "2px 0 #000000, -2px 0 #000000, 0 2px #000000, 0 -2px #000000, 1px 1px #000000, -1px -1px #000000, 1px -1px #000000, -1px 1px #000000",
							position: "absolute",
							left: "150px",
							top: "2px",
							color: "white"
						}}
					>
						Tiwabs Audio Door Tool
					</Title>
					<ActionIcon
						sx={{
							position: "absolute",
							WebkitAppRegion: "no-drag",
							top: "2px",
							left: "520px",
							"&:hover": {
								color: "rgb(25, 25, 25)",
								backgroundColor: "rgba(0, 0, 0, 0)"
							}
						}}
						onClick={appQuit}
					>
						<AiFillCloseCircle size={50} />
					</ActionIcon>
					<ActionIcon
						sx={{
							position: "absolute",
							WebkitAppRegion: "no-drag",
							top: "2px",
							left: "495px",
							"&:hover": {
								color: "rgb(25, 25, 25)",
								backgroundColor: "rgba(0, 0, 0, 0)"
							}
						}}
						onClick={appMinimize}
					>
						<AiFillMinusCircle size={50} />
					</ActionIcon>
				</Group>
			</Paper>
		</>
	)
}