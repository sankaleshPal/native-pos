import type { PrintData } from '../db/services/kotService';

/**
 * Format KOT data for printing
 * Returns a formatted string ready for printing
 */
export const formatForPrint = (data: PrintData): string => {
  const { kotId, tableName, punchedBy, punchedAt, items, total } = data;

  const date = new Date(punchedAt);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString();

  let printText = '';
  printText += '================================\n';
  printText += '       KITCHEN ORDER TICKET      \n';
  printText += '================================\n\n';
  printText += `KOT #: ${kotId}\n`;
  printText += `Table: ${tableName}\n`;
  printText += `Punched by: ${punchedBy}\n`;
  printText += `Date: ${dateStr}\n`;
  printText += `Time: ${timeStr}\n`;
  printText += '--------------------------------\n\n';

  printText += 'ITEMS:\n';
  printText += '--------------------------------\n';

  items.forEach((item, index) => {
    printText += `${index + 1}. ${item.dish_name}\n`;

    if (item.portion_name) {
      printText += `   Portion: ${item.portion_name}\n`;
    }

    if (item.extras) {
      try {
        const extras = JSON.parse(item.extras);
        if (extras.length > 0) {
          printText += `   Add-ons: ${extras
            .map((e: any) => `${e.name} (${e.quantity})`)
            .join(', ')}\n`;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    printText += `   Qty: ${item.quantity}  Price: ₹${item.item_total}\n\n`;
  });

  printText += '--------------------------------\n';
  printText += `TOTAL: ₹${total.toFixed(2)}\n`;
  printText += '================================\n';

  return printText;
};

/**
 * Prepare print data (can be extended for actual printer integration)
 */
export const preparePrintData = (data: PrintData): string => {
  return formatForPrint(data);
};
