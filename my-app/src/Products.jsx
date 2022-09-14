import React from 'react';

class Products extends React.Component {

    constructor() {
        super();
        this.state = {
            products: [],
            productsInit: [],
            editable: false,
            productToUpdate: [],
            numberOfPages: 0,
            currentPage: 1,
            productsShown: [],
            user: JSON.parse(sessionStorage.getItem("user"))
        }
    }

    setPageShown = () => {
        const startPos = (this.state.currentPage - 1) * 10;
        let endPosit = startPos + 10;
        if (endPosit + 1 > this.state.products.length)
            endPosit = this.state.products.length;

        const productsShown = [];
        for (let i = startPos; i < endPosit; i++)
            productsShown.push(this.state.products[i]);
        this.setState({ productsShown: productsShown });
    }

    componentDidMount() {
        this.props.productsInit(this);
    }

    onChangeSave = () => {
        let productListUpdate = [];
        let link;
        if (this.props.allNew) {
            productListUpdate = this.state.products;
            link = "http://localhost/Accenture_final_web_store/backend/createProducts.php"
        }
        else {
            for (let i = 0; i < this.state.productToUpdate.length; i++) {
                if (this.state.productToUpdate[i] !== true)
                    continue;
                const productId = i;
                const product = this.state.products.find((product) => {
                    return product.id === productId;
                })
                productListUpdate.push(product);
            }
            link = "http://localhost/Accenture_final_web_store/backend/updateProduct.php";
        }
        const headers = new Headers();
        headers.append("Content-type", "application/json");
        const self = this;
        fetch(link, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(productListUpdate)
        }).then(function (response) {
            response.json().then((body) => {
                alert(body);
                const productsInit = self.state.products;
                self.setProductTable(productsInit);
                self.setState({ productToUpdate: [] });
            })
        })
    }

    updateProduct = (id, fieldname, value) => {
        const products = this.state.products;//copy the array
        const productUpd = products.find((product) => {
            return product.id === id;
        })
        productUpd[fieldname] = value;
        const productsToUpdateIds = this.state.productToUpdate;
        productsToUpdateIds[id] = true;

        this.setState({ products: products, productToUpdate: productsToUpdateIds });
    }


    setProductTable(productsLoad) {
        const initProducts = [];
        productsLoad.map((obj) => {
            initProducts.push(Object.assign({}, obj));
        })
        const pagesNo = Math.ceil(productsLoad.length / 10);
        this.setState({
            products: initProducts,
            productsInit: productsLoad, numberOfPages: pagesNo
        });
        this.setPageShown();
    }

    setEditable = () => {
        const editable = !this.state.editable;
        this.setState({ editable: editable });
    }

    onInputChange = (event, id) => {
        const fieldname = event.target.getAttribute("fieldname");
        const value = event.target.value;
        this.updateProduct(id, fieldname, value);
    }

    onCancel = () => {
        const products = this.state.productsInit;
        this.setProductTable(products);
        this.setEditable();
    }
    switchPageEvent = (event) => {
        this.switchPage(
            Number(event.target.innerHTML));
    }

    switchPage = (pageNo) => {
        this.setState({ currentPage: pageNo });
        this.setPageShown();
    }

    nextPage = () => {
        this.switchPage(++this.state.currentPage);
    }

    previousPage = () => {
        this.switchPage(--this.state.currentPage);
    }

    generatePageItems = () => {
        const pagesArr = [];
        if (this.state.currentPage > 1)
            pagesArr.push(<li className="page-item" key={"prev"}>
                <button type='button' className="btn btn-primary"
                    onClick={this.previousPage}>Previous</button>
            </li>)
        for (let i = 1; i <= this.state.numberOfPages; i++) {
            pagesArr.push(<li className="page-item" key={i}>
                <button type='button' className={this.state.currentPage
                    === i ? "btn btn-primary" : "btn"}
                    onClick={this.switchPageEvent}>{i}</button>
            </li>);
        }
        if (this.state.currentPage < this.state.numberOfPages)
            pagesArr.push(<li className="page-item" key={"next"}>
                <button type='button' className="btn btn-primary"
                    onClick={this.nextPage}>Next</button>
            </li>)
        return pagesArr;
    }


    render() {
        return (

            <form method='POST'>
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        {this.generatePageItems()}
                    </ul>
                </nav>

                {this.state.user.roleID === 1 &&
                    <div>
                        <button className='btn' type='button' onClick={this.setEditable}>
                            Edit
                        </button>
                        <button className='btn' onClick={() => { this.onChangeSave() }} type="button">
                            Save
                        </button>
                        <button className='btn' onClick={this.onCancel} type="button">
                            Cancel
                        </button>
                    </div>
                }


                <table>
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            !(this.state.productsShown === undefined) && this.state.productsShown.map((product) => {
                                return (
                                    <tr key={product.id} onChange={
                                        (e) => this.onInputChange(e, product.id)}>
                                        <td>
                                            <div hidden={this.state.editable}>
                                                {product.brand}
                                            </div>
                                            <input hidden={!this.state.editable}
                                                fieldname="brand"
                                                defaultValue={product.brand}></input>
                                        </td>
                                        <td>
                                            <div hidden={this.state.editable}>
                                                {product.model}
                                            </div>
                                            <input hidden={!this.state.editable}
                                                fieldname="model"
                                                defaultValue={product.model}></input>
                                        </td>
                                        <td>
                                            <div hidden={this.state.editable}>
                                                {product.price}
                                            </div>
                                            <input hidden={!this.state.editable}
                                                fieldname="price"
                                                defaultValue={product.price}></input>
                                        </td>
                                    </tr>
                                );
                            })
                        }

                    </tbody>

                </table>
            </form>
        );
    }
}

export default Products;