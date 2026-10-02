export const SHOP = `query DiscountShop { shop { currencyCode } }`;
export const GET_DISCOUNT = `query GetMstrmndDiscount($id: ID!) {
  discountNode(id: $id) {
    configuration: metafield(namespace: "$app:mstrmnd", key: "cart-incentive") { id value }
    discount { __typename ... on DiscountAutomaticApp {
      title startsAt endsAt appDiscountType { functionId }
    } }
  }
}`;
export const CREATE_DISCOUNT = `mutation CreateMstrmndDiscount($discount: DiscountAutomaticAppInput!) {
  result: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
    automaticAppDiscount { discountId }
    userErrors { field message }
  }
}`;
export const UPDATE_DISCOUNT = `mutation UpdateMstrmndDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
  result: discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $discount) {
    automaticAppDiscount { discountId }
    userErrors { field message }
  }
}`;
