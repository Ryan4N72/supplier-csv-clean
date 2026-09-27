/** 演示样例：打包进 JS，避免 CSP connect-src 挡住 fetch */

export const SAMPLE_SUPPLIER_CSV = '\ufeffSKU,Name,Price,Inventory\nTEE-BLK-S,Basic Tee Black S,99.00,150\nTEE-BLK-M,Basic Tee Black M,89.00,80\nTEE-WHT-S,Basic Tee White S,92.50,"1,250"\nMUG-001,Classic Mug,45,200\n1.23E+12,Barcode in scientific notation,19.9,50\n3/15/24,SKU swallowed by date,15,10\nONLY-SUPPLIER,Supplier-only SKU,33,5\nBAG-01,Canvas Bag,,\n0123456789012,Barcode with leading zero,25.00,300\n';

export const SAMPLE_SHOPIFY_CSV = '\ufeffHandle,Title,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Option3 Name,Option3 Value,Variant SKU,Variant Price,Variant Inventory Qty\nbasic-tee,Basic Tee,Color,Black,Size,S,,,TEE-BLK-S,89.00,120\nbasic-tee,,Color,Black,Size,M,,,TEE-BLK-M,89.00,100\nbasic-tee,,Color,White,Size,S,,,TEE-WHT-S,92.50,40\nclassic-mug,Classic Mug,Title,Default Title,,,,,MUG-001,49.00,200\nbarcode-demo,Barcode demo,Title,Default Title,,,,,1230000000000,19.9,50\ncanvas-bag,Canvas Bag,Title,Default Title,,,,,BAG-01,28.00,60\nshopify-only,Shop-only product,Title,Default Title,,,,,SHOP-ONLY,10.00,7\nleading-zero-demo,Leading zero demo,Title,Default Title,,,,,0123456789012,25.00,280\n';

export const SAMPLE_SUPPLIER_FILENAME = "supplier-catalog.csv";
export const SAMPLE_SHOPIFY_FILENAME = "shopify-products-export.csv";
