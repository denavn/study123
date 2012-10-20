

exports.Bank = new (require("./Social/JP/_RequireLoader").RequireLoader)({
	"Debit": function() { return require('./Bank/JP/Service/Banking/Debit').Debit; },
	"Inventory": function() { return require('./Bank/JP/Service/Banking/Inventory').Inventory; }
});
