CAPORAL_DTS=./docs/.vuepress/public/assets/js/caporal.d.ts
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "1"
  # sed -i '' -e 's/declare module "index"/declare module "caporal"/' $CAPORAL_DTS
else
  echo "2"
  # sed -i -e 's/declare module "index"/declare module "caporal"/' $CAPORAL_DTS
fi  
