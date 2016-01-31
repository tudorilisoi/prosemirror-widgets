import {baseCommands} from "prosemirror/dist/edit"
import sortedInsert from "prosemirror/dist/util/sortedinsert"

export function defineInsertMenu(menuName, attrs) {
	if (!attrs.label) attrs.label = "Insert an element"
	if (!attrs.defaultLabel) attrs.defaultLabel = "Insert"
	if (!attrs.rank) attrs.rank = 50
	baseCommands[menuName] = {
	  label: attrs.label,
	  run(pm, value) {
	    if (value.info.command)
	      return pm.execCommand(value.type.name + ":" + value.info.command)
	    else
	      return pm.tr.replaceSelection(value.type.create(value.info.attrs)).apply(pm.apply.scroll)
	  },
	  select(pm) {
	    return currentInsertOptions(pm).length > 0
	  },
	  params: [
	    {label: "Type", type: "select", options: currentInsertOptions, defaultLabel: attrs.defaultLabel}
	  ],
	  display: {
	    type: "param"
	  },
	  menuGroup: "insert("+attrs.rank+")",
	}
	
	function rank(obj) { return obj.rank == null ? 50 : obj.rank }

	function listInsertOptions(pm) {
	  return pm.schema.cached[menuName] ||
	    (pm.schema.cached[menuName] = buildInsertOptions(pm.schema))
	}
	
	function buildInsertOptions(schema) {
	  let found = []
	  schema.registry(menuName, (_, info, type) => {
	    sortedInsert(found, {label: info.label, value: {type, info}},
	                 (a, b) => rank(a.value.info) - rank(b.value.info))
	  })
	  return found
	}
	
	function currentInsertOptions(pm) {
	  return listInsertOptions(pm).filter(option => {
	    let cmd = option.value.info.command
	    if (cmd) {
	      let found = pm.commands[option.value.type.name + ":" + cmd]
	      return found && found.select(pm)
	    } else {
	      return option.value.type.isBlock ||
	        pm.doc.path(pm.selection.from.path).type.canContainType(option.value.type)
	    }
	  })
	}
}