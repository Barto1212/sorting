"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readCSV_1 = require("./utils/readCSV");
const locale_1 = require("date-fns/locale");
const date_fns_1 = require("date-fns");
const formatNumber_1 = require("./utils/formatNumber");
const generateEmptyResults_1 = require("./utils/generateEmptyResults");
const sumPurgedPo_1 = require("./utils/sumPurgedPo");
const fs = require("fs");
const purgeDir_1 = require("./utils/purgeDir");
(0, date_fns_1.setDefaultOptions)({ locale: locale_1.fr });
(0, purgeDir_1.default)('./out');
const SQL = (0, readCSV_1.getSQL)();
const purgedPO = (0, readCSV_1.getPurgedPO)();
const SB_DO = (0, readCSV_1.getSB_DO)();
const products = (0, generateEmptyResults_1.default)(SQL);
const startPeriod = (0, date_fns_1.parse)('01/04/2023', 'dd/MM/yyyy', new Date());
const endPeriod = (0, date_fns_1.parse)('05/04/2023', 'dd/MM/yyyy', new Date());
SQL.forEach((row) => {
    const product = products.find((prod) => prod.productLabel === row.FAB_MAS_PAL_MAS_LIB_COURT);
    // Cas théoriquement non réalisable :
    // if (!product) return
    const endDate = (0, date_fns_1.parse)(row.FAB_MAS_PAL_DATE_FIN, 'dd/MM/yyyy HH:mm:ss', new Date());
    const endsOnPeriod = (0, date_fns_1.isWithinInterval)(endDate, {
        start: startPeriod,
        end: endPeriod,
    });
    if (endsOnPeriod) {
        product.FAB_MAS_PAL_NUM_PO.push((0, formatNumber_1.default)(row.FAB_MAS_PAL_NUM_PO));
        product.FAB_MAS_PAL_TONNAGE_MASSE.push((0, formatNumber_1.default)(row.FAB_MAS_PAL_TONNAGE_MASSE));
    }
});
const productsCompleted_PO = products.map((product) => {
    const col3 = product.FAB_MAS_PAL_NUM_PO.map((po) => {
        const QtePOPaletiseeKg = purgedPO.reduce((accumulator, purgedPOItem) => {
            if (po === (0, formatNumber_1.default)(purgedPOItem.PO)) {
                return accumulator + (0, formatNumber_1.default)(purgedPOItem.QtePOPaletiseKg);
            }
            return accumulator;
        }, 0);
        return QtePOPaletiseeKg;
    });
    const col4 = col3.map((col3Data, index) => col3Data - product.FAB_MAS_PAL_TONNAGE_MASSE[index]);
    return Object.assign(Object.assign({}, product), { col3, col4 });
});
const SB_DO_with_typeProduit = SB_DO.map((SB_DO_item) => {
    var _a;
    const TypeProduit = (_a = purgedPO.find((product) => SB_DO_item.OF === product.OF)) === null || _a === void 0 ? void 0 : _a.TypeProduit;
    return Object.assign(Object.assign({}, SB_DO_item), { TypeProduit });
});
const typeProduitList_OF = [];
SB_DO_with_typeProduit.forEach((item) => {
    const { OF, TypeProduit } = item;
    if (!TypeProduit)
        return;
    const typeProduitListItem = typeProduitList_OF.find((d) => d.TypeProduit === TypeProduit);
    if (typeProduitListItem) {
        // Pour ne pas avoir de répétition d'OF :
        if (typeProduitListItem.OF.includes(OF))
            return;
        typeProduitListItem.OF.push(OF);
    }
    else {
        typeProduitList_OF.push({ TypeProduit, OF: [OF] });
    }
});
// Pour avoir des tableaux de la même dimension (tous les produits de SQL ne sont pas dans purgedPO)
const filtredProductsCompleted_PO = productsCompleted_PO.filter((item) => {
    const isHere = typeProduitList_OF.find((i) => {
        // console.log(i.TypeProduit,item.productLabel)
        return i.TypeProduit === item.productLabel;
    });
    return !!isHere;
});
const filtredTypeProduitList_OF = typeProduitList_OF.filter((item) => {
    const isHere = productsCompleted_PO.find((i) => {
        // console.log(i.productLabel,item.TypeProduit)
        return i.productLabel === item.TypeProduit;
    });
    return !!isHere;
});
// console.log(filtredProductsCompleted_PO.length)
// console.log(filtredTypeProduitList_OF.length)
filtredTypeProduitList_OF.forEach((OF_item) => {
    const coll5 = {};
    const title = OF_item.TypeProduit;
    const POlist = filtredProductsCompleted_PO.find((i) => i.productLabel === title).FAB_MAS_PAL_NUM_PO;
    let titleOutArray = 'col1 col2 col3 col4';
    for (const i in OF_item.OF) {
        const OF = OF_item.OF[i];
        titleOutArray = titleOutArray + ' ' + OF;
        coll5[OF] = {};
        POlist.forEach((PO) => {
            const sum = (0, sumPurgedPo_1.default)(purgedPO, OF, PO);
            coll5[OF][PO] = sum;
        });
    }
    console.log(`--------------------------${title}--------------------------`);
    console.log(filtredProductsCompleted_PO.find((p) => p.productLabel === title));
    console.log(coll5);
    const destinationPath = `./out/${title}.csv`;
    let csvString = `${titleOutArray}\n`;
    csvString += 'hello';
    fs.writeFileSync(destinationPath, csvString);
});
