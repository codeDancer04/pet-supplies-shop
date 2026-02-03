type Item = {
  id: number;
  name: string;
  category: string;
  price: number;
  img_url: string;
};

type ItemListProps = {
  products?: Item[];
  loading?: boolean;
};

// ProductList.tsx
import ItemBlock from '../ItemBlock';
import { Spin, Empty } from 'antd';
import styles from './index.module.css';

const ProductList = ({ products = [], loading = false }: ItemListProps) => {
  if (loading) return <Spin tip="加载中..." />;
  if (products.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  return (
    <div className={styles["item-list"]}>
      {products.map(product => (
        <ItemBlock
          key={product.id}
          name={product.name}
          category={product.category}
          productId={product.id}
          price={product.price}
          img_url={product.img_url}
        />
      ))}
    </div>
  );
};

export default ProductList;
