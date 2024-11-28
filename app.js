const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: 'uz0eyvo7nqgg',
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: 'tZhSK69iV496Cg56mw6I_NE8xaeV2LnZI1fciUTlRLc',
});

// console.log(client);


//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartTotal = document.querySelector('.cart-total');
const cartItems = document.querySelector('.cart-items');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
// buttons
let buttonDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {

      // let contentful = await client.getEntries({
      //   content_type:"comfyHouseProductExample"
      // });
      // console.log(contentful);
      
      let result = await fetch("products.json");
      let data = await result.json();


      let products = data.items;
      console.log(contentful.items);

      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// anoher way 
// class Products {
//   async getProducts() {
//     try {

//       let contentful = await client.getEntries({
//         content_type:"comfyHouseProductExample"
//       });
//       // console.log(contentful);
      
//       let result = await fetch("products.json");
//       let data = await result.json();


//       let products = contentful.items;
//       console.log(contentful.items);
//       products = products.map((item) => {
//         let imageUrl = "";

//         if (item.fields.image && item.fields.image.sys.id) {
//           const imageAsset = contentful.includes?.Asset?.find(
//             (asset) => asset.sys.id === item.fields.image.sys.id
//           );
//           imageUrl = imageAsset?.fields?.file?.url
//             ? `https:${imageAsset.fields.file.url}`
//             : "default-image-url.jpg"; // صورة افتراضية في حال عدم وجود صورة
//         }
//         const { title, price } = item.fields;
//         const { id } = item.sys;
//         return { title, price, id, imageUrl };
//       });
//       return products;
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// display products
class UI {
  displayProducts(products) {
    //   console.log(products);
    let result = "";
    products.forEach((product) => {
      result += `
          <!--single product-->
        <article class="product">
          <div class="img-container">
            <img
              src="${product.image}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"> add to cart </i>
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!--end of single product-->
      </div>
    </section>
    <!--end of products-->
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = buttons;
    // console.log(buttons);
    buttons.forEach((button) => {
      let id = button.dataset.id;
      //  console.log(id);
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", (event) => {
          //   console.log(event);
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // console.log(cartItem);
          // add product to the cart
          cart = [...cart, cartItem];
          // console.log(cart);

          // save cart in local storage
          Storage.saveCart(cart);
          // set cart values
          this.setCartValues(cart);
          // display cart item
          this.addCartItem(cartItem);
          // show the cart
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    //  console.log(cartTotal,cartItems);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src="${item.image}" alt="product-1" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>

            </div>
   `;
    cartContent.appendChild(div);
    //  console.log(cartContent);
  }
  showCart() {
      cartOverlay.classList.add("transparentBcg");
      cartDOM.classList.add("showCart");
  }

  setupApp(){
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click',this.showCart);
    closeCartBtn.addEventListener('click',this.hideCart);

  }
  hideCart(){
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  populateCart(cart){
    cart.forEach(item=>this.addCartItem(item));
  }


  cartLogic(){
    clearCartBtn.addEventListener('click',()=>{
      this.clearCart();
    });

    // cart functionality
    cartContent.addEventListener('click',event=>{
      // console.log(event.target);
      if(event.target.classList.contains('remove-item')){
        let removeItem = event.target;
        // console.log(removeItem);
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
        
      }
      else if(event.target.classList.contains('fa-chevron-up')){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        // console.log(addAmount);
        let tempItem = cart.find(item=>item.id ===id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        //TODO nextElementSibling
        addAmount.nextElementSibling.innerText = tempItem.amount;
        
      }
      else if(event.target.classList.contains('fa-chevron-down')){
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        // console.log(addAmount);
        let tempItem = cart.find(item=>item.id ===id);
        tempItem.amount = tempItem.amount - 1;
        if(tempItem.amount > 0){
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      
      }
      
    });


  }
  clearCart(){
    // console.log(this);
    let cartItems = cart.map(item=>item.id);
    // console.log(cartItems);
    cartItems.forEach(id=>this.removeItem(id));
    console.log(cartContent.children);
    
    while(cartContent.children.length > 0 ){
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart();
    
  }
  removeItem(id){
   cart = cart.filter(item=>item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <i class = "fas fa-shopping-cart">
    </i> add to cart
    `
   
  }
  getSingleButton(id){
    return buttonDOM.find(button=>button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart(){
    return localStorage.getItem('cart') ?JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // setup app
  ui.setupApp();

  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
