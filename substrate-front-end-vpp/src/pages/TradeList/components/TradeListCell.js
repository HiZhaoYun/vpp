import React  from 'react';
import { Row, Col, Divider, Button } from 'antd';
import styles from '../style.less';

const TradeListCell = props => {
  const { item, admin, buyClick, sellClick, editClick, closeClick } = props;
  return (
    <div className={styles.tradeListCell}>
      <Row>
        <Col span={12}>{`账户地址：${item.address}`}</Col>
        <Col span={8}>{`交易时间：${item.latest}`}</Col>
        <Col span={4}>{`成交额：${item.total}`}</Col>
      </Row>
      <br/>
      <Row>
        <Col span={2} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <img alt="logo" width="100px" src={item.logo} />
        </Col>
        <Col span={4}>
          <div className={styles.listContent}>
            <div className={styles.listContentItem}>
              <span>{item.vpp_name}</span>
              <p>{`类型: ${(item.energy_type === 0) ? "光电" : ((item.energy_type === 1) ? "风电" : "火电")}`}</p>
              <span>{`邮编: ${item.post_code}`}</span>
              <p>{`线损: ${item.transport_lose}`}</p>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className={styles.listContent}>
            <div className={styles.listContentItem}>
              <span>{`可销售度数: ${item.pre_total_stock}`}</span>
              <p>{`售价: ${item.sell_price}`}</p>
            </div>
          </div>
        </Col>
        <Col span={4}>
          <div className={styles.listContent}>
            <div className={styles.listContentItem}>
              <span>{`需购买度数: ${item.needBuy}`}</span>
              <p>{`售价: ${item.buy_price}`}</p>
            </div>
          </div>
        </Col>
        <Col span={5}>
          <div className={styles.listContent}>
            <div className={styles.listContentItem}>
              <span>{item.business_status === 'Opened' ? '营业中':'歇业'}</span>
            </div>
          </div>
        </Col>
        <Col span={5}>
          <>
            <Button type="primary" size="default" onClick={buyClick}>购买</Button>
            <Divider orientation="center" type="vertical"/>
            <Button type="primary" danger size="default" onClick={sellClick}>出售</Button>
          </>
          {
            admin ?
              <div style={{marginTop: 10, hidden: true}}>
                <Button type="primary" size="default" onClick={editClick}>编辑</Button>
                <Divider orientation="center" type="vertical"/>
                <Button type="primary" danger size="default" onClick={() => closeClick(item.status === '歇业' ? "开业" : "歇业")}>{item.status === '歇业' ? "开业" : "歇业"}</Button>
              </div>
              :
              null
          }
        </Col>
      </Row>
      <Divider type="horizontal"/>
    </div>
  );
};

export default TradeListCell;
