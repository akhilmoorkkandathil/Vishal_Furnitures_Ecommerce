const fs=require('fs')
const path=require('path')
const productModel = require('../model/productSchema')
const categoryModel=require('../model/categorySchema')
const { log } = require('console')


const addProduct = async(req,res)=>{
  try {
    // Assuming productModel.find() returns an array of objects
    const categories = await categoryModel.find({})
     console.log(categories);
    let obj=[]
    let maps =categories.map((item)=>{
        let test={
            "_id":item._id,
            "name":item.name,
        }
        obj.push(test)
    })
    await res.render('./admin/addProduct',{obj,Admin:true,category:obj})
} catch (err) {
    console.log(err);
    res.send("Error Occurred");
}
    
}


const productAdded = async (req, res) => {
    try {
        console.log(req.files);
        console.log("===========================1");
        const { product, category,price,stock, description} = req.body
        const newproduct = new productModel({
            name: product,
            category: category,
            price: price,
            stock:stock,
            images: req.files.map(file => file.filename),
            description: description
        })
        console.log("===========================2");
        console.log(newproduct);
        await newproduct.save()
        res.redirect('/admin/products')
        //console.log('okay aanu');
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const productList = async (req, res) => {
    try {
        // Assuming productModel.find() returns an array of objects
        const products = await productModel.find()
         console.log(products);
        let obj=[]
        let maps =products.map((item)=>{
            let test={
                "_id":item._id,
                "name":item.name,
                "price":item.price,
                "category":item.category,
                "images":item.images,
                "stock":item.stock,
                "status":item.status,
                "description":item.description
            }
            obj.push(test)
        })
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        await res.render("./admin/productList", { obj, Admin: true });
    } catch (err) {
        console.log(err);
        res.send("Error Occurred");
    }
};

// product unlisting 
const unlistProduct = async (req, res) => {
    try {
      const id = req.params.id;
      const product = await productModel.findById(id);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      console.log(product);
  
      product.status = !product.status;
      await product.save();
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  // product deleting
  const deleteProduct = async (req, res) => {
    try {
      const id = req.params.id;
      await productModel.deleteOne({ _id: id });
      res.redirect("/admin/products");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };

  const editProduct = async (req, res) => {
    try {
      console.log("=============OKAY==============");
      const id = req.params.id;
      const product = await productModel.findById(id);
      const pr=[product]
      
      let arr=[]
        let maps =pr.map((item)=>{
            let test={
                "_id":item._id,
                "name":item.name,
                "price":item.price,
                "category":item.category,
                "images":item.images,
                "stock":item.stock,
                "status":item.status,
                "description":item.description
            }
            arr.push(test)
        })
        const categories = await categoryModel.find({})
     console.log(categories);
    let obj=[]
    let map =categories.map((item)=>{
        let test={
            "_id":item._id,
            "name":item.name,
        }
        obj.push(test)
    })
      
      console.log(arr);
      
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.render("./admin/updateProduct", { product:arr[0],category:obj, Admin: true });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };
  


  // updating the  product
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, stock, price, description ,category} = req.body;
    const product = await productModel.find({_id:ObjectId(id)});
    product.name = name;
    product.price = price;
    product.stock = stock;
    product.category= category;
    product.description = description;
    await product.save();
    res.redirect("/admin/productlist");
    if(req.file.image){

    }
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};
  
 

const categories = async (req,res)=>{
    await res.render('./admin/categoryList',{Admin:true})
}
const addCategory = async (req,res)=>{
    await res.render('./admin/addCategory',{Admin:true})
}

// admin new category adding 
const addedCategory = async (req, res) => {
  try {
    console.log("=================1");
      const catName = req.body.catname;
      const catdes = req.body.catdes;

      const categoryExist = await categoryModel.findOne({ name:catName });
      if(categoryExist){
        console.log("=================2");
        req.flash("error", "This category already exist");
        return res.redirect('/admin/addcategory')
      }else{
        console.log("=================3");
        await categoryModel.insertMany({ 
          name: catName, 
          description: catdes,
          status:true 
        });
        res.redirect("/admin/categorylist");
      }
   
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


const catList = async (req,res)=>{
  try {
      console.log("=================");
      // Assuming productModel.find() returns an array of objects
      const categories = await categoryModel.find()
      //console.log(products);
      let obj=[]
      let maps =categories.map((item)=>{
          let test={
              "_id":item._id,
              "name":item.name,
              "description":item.description,
              "status":item.status
          }
          obj.push(test)
      })
      console.log(obj);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      await res.render('./admin/categoryList',{obj,Admin:true})
  } catch (err) {
      console.log(err);
      res.send("Error Occurred");
  }
  
}






// product unlisting 
const unlistCategory = async (req, res) => {
  try {
    console.log("==========================1212");
    const id = req.params.id;
    const Category = await categoryModel.findById(id);

    if (!Category) {
      return res.status(404).send("Category not found");
    }

    console.log(Category);

    Category.status = !Category.status;
    await Category.save();
    res.redirect("/admin/categorylist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// category deleting
const deletingCategory = async (req, res) => {
  try {
      console.log("okay");
    const id = req.params.id;
    await categoryModel.deleteOne({ _id: id });
    res.redirect("/admin/categorylist");
    console.log("okay deleted");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// admin category update page
const updatecat = async (req, res) => {
  try {
    console.log("====================");
      const id = req.params.id;
      const cat = await categoryModel.findOne({ _id: id });
      const category=[cat]
      let obj=[]
      let maps =category.map((item)=>{
          let test={
              "_id":item._id,
              "name":item.name,
              "description":item.description,
              "status":item.status
          }
          obj.push(test)
      })
      console.log(obj);
      res.render("./admin/editCategory", { Admin: true,category:obj[0] });
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


// admin category updating
const updateCategory = async (req, res) => {
  try {
      const id = req.params.id;
      const catName = req.body.catname;
      const catdes = req.body.catdes;
      await categoryModel.updateOne(
        { _id: id },
        { name: catName, description: catdes }
      );
      res.redirect("/admin/categorylist");
    
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};



module.exports ={addProduct,productList,categories,addCategory,productAdded,unlistProduct,deleteProduct,editProduct,addedCategory,catList,unlistCategory,deletingCategory,updatecat,updateCategory,updateProduct}