/** 演示样例：打包进 JS，避免 CSP connect-src 挡住 fetch */

export const SAMPLE_SUPPLIER_CSV = '\ufeffSKU,Name,Price,Inventory\nTEE-BLK-S,基础 T 恤 黑 S,99.00,150\nTEE-BLK-M,基础 T 恤 黑 M,89.00,80\nTEE-WHT-S,基础 T 恤 白 S,92.50,"1,250"\nMUG-001,马克杯经典款,45,200\n1.23E+12,条码科学计数法示例,19.9,50\n3/15/24,疑似日期吞掉的货号,15,10\nONLY-SUPPLIER,仅供应商有的 SKU,33,5\nBAG-01,帆布袋,,\n0123456789012,前导零条码文本,25.00,300\n';

export const SAMPLE_SHOPIFY_CSV = '\ufeffHandle,Title,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Option3 Name,Option3 Value,Variant SKU,Variant Price,Variant Inventory Qty\nbasic-tee,基础 T 恤,Color,Black,Size,S,,,TEE-BLK-S,89.00,120\nbasic-tee,,Color,Black,Size,M,,,TEE-BLK-M,89.00,100\nbasic-tee,,Color,White,Size,S,,,TEE-WHT-S,92.50,40\nclassic-mug,马克杯经典款,Title,Default Title,,,,,MUG-001,49.00,200\nbarcode-demo,条码演示,Title,Default Title,,,,,1230000000000,19.9,50\ncanvas-bag,帆布袋,Title,Default Title,,,,,BAG-01,28.00,60\nshopify-only,仅店铺有的商品,Title,Default Title,,,,,SHOP-ONLY,10.00,7\nleading-zero-demo,前导零演示,Title,Default Title,,,,,0123456789012,25.00,280\n';

export const SAMPLE_SUPPLIER_FILENAME = "supplier-catalog.csv";
export const SAMPLE_SHOPIFY_FILENAME = "shopify-products-export.csv";
