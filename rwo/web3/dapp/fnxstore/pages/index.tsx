import ProductList from "@/components/product_list";

export default function Home() {
    return (
        <div className='flex h-full flex-col justify-center items-center'>
            <ProductList />
        </div>
    );
  }