export {BlockMath} from "./blockmath"
export {Website} from "./website"
export {InlineMath} from "./inlinemath"
export {Image} from "./image"
export {SpreadSheet} from "./spreadsheet"
export {CarryForward} from "./carryforward"

import {defineInsertMenu} from "../../utils"
import {BlockMath} from "./blockmath"
import {Website} from "./website"
import {InlineMath} from "./inlinemath"
import {Image} from "./image"
import {SpreadSheet} from "./spreadsheet"
import {CarryForward} from "./carryforward"
import {HorizontalRule} from "prosemirror/dist/model"

const menuName = "insertContentMenu"
defineInsertMenu(menuName, {label: "Insert content elements", defaultLabel: "Content", rank:49})

// move hr to content menu
HorizontalRule.register("insertMenu", "main", null)
HorizontalRule.register(menuName, "main", {label: "Horizontal rule", command: "insert", rank: 70})

Image.register(menuName, "main", {label: "Image", command: "insert", rank: 76})
Website.register(menuName, "main", {label: "Website", command: "insert", rank: 77})
InlineMath.register(menuName, "main", {label: "Inline Math", command: "insert", rank: 78})
BlockMath.register(menuName, "main", {label: "Block Math", command: "insert", rank: 79})
SpreadSheet.register(menuName, "main", {label: "Spreadsheet", command: "insert", rank: 80})
CarryForward.register(menuName, "main", {label: "Carry Forward", command: "insert", rank: 81})

