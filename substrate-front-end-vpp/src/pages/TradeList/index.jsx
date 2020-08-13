import React, {useState, useEffect, useContext} from 'react';
import {
  Card,
  Input,
  List,
  Radio,
  Button, message, Modal
} from 'antd';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {web3FromSource} from "@polkadot/extension-dapp";
import TradeListCell from "@/pages/TradeList/components/TradeListCell";
import {AccountsContext} from "@/context/accounts";
import {ApiContext} from "@/context/api";
import {transformParams, txErrHandler, txResHandler} from "@/components/TxButton/utils";
import OperationModal from './components/OperationModal';
import AddEditModal from "./components/AddEditModal";
import styles from './style.less';
import Wind from "./assets/wind.png";
import Light from "./assets/light.png";
import Fir from "./assets/fir.png";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const {Search} = Input;

const paginationProps = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSize: 5,
};

const convert = (from, to) => str => Buffer.from(str, from).toString(to);
const utf8ToHex = convert('utf8', 'hex');
const hexToUtf8 = convert('hex', 'utf8');

export const TradeList = () => {
  const [visible, setVisible] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [operation, setOperation] = useState(1);// 1购买 2出售
  const [addEdit, setAddEdit] = useState(1);// 1新增 2编辑
  const [unsub, setUnsub] = useState(null);

  const [count, setCount] = useState();
  const [dataSource, setDataSource] = useState([]);
  const {address,keyring} = useContext(AccountsContext);
  const {api} = useContext(ApiContext);
  const [accountPair, setAccountPair] = useState(null);

  const [values, setValues] = useState({});

  // get pair
  useEffect(() => {
    if (!api && !keyring && !address) return;
    setAccountPair(keyring.getPair(address));
  },[keyring]);

  // get vpp count
  useEffect(() => {
    if (!api || !address) return;
    api.query.tradeModule.vppCounts(address, (result) => {
      if (!result.isNone) {
        console.log(`电厂数量：${result.toNumber()}`);
        setCount(result.toNumber());
      }
    });
  },[api]);

  // get datasource
  useEffect(() => {
    if (!api || !count) return;
    const source = [];
    for (let i=0; i<count; i++ ) {
      api.query.tradeModule.vppList([address,i], (result) => {
        if (!result.isNone) {
          const data = result.toJSON();
          console.log(JSON.stringify(data));
          source.push({
            id: i,
            address: address,
            logo: (data.energy_type === 0) ? Light : ((data.energy_type === 1) ? Wind : Fir),
            latest: new Date().toLocaleDateString(),
            total: 0,
            pre_total_stock: data.pre_total_stock,
            needBuy: 0,
            vpp_name: "南京市发电厂",
            energy_type: data.energy_type,
            sell_price: data.sell_price,
            buy_price: data.buy_price,
            business_status: data.business_status,
            post_code: "210000",
            transport_lose: data.transport_lose,
            device_id: data.device_id,
            electric_type: data.electric_type
          });
        }
      });
    }
    setTimeout(function () {
      setDataSource(source);
    }, 500*count);
  }, [count, api]);

  //  *********** create vpp *********** //
  const getFromAcct = async () => {
    if (!accountPair) {
      console.log('No accountPair!');
      return ;
    }

    const {
      addr,
      meta: {source, isInjected}
    } = accountPair;
    let fromAcct;

    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = addr;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }

    return fromAcct;
  };

  const signedTx = async (values) => {
    const paramFields = addEdit === 2 ? [true, true, true, true, true, true, true, true, true] : [true, true, true, true, true, true, true, true, true, true, true];
    const inputParams =
      addEdit === 2 ?
      [
        values.name,
        values.energy_type,
        values.pre_total_stock,
        values.buy_price,
        values.sell_price,
        values.post_code,
        values.transport_lose,
        values.device_id,
        0,
      ] : [
          values.name,
          values.pre_total_stock,
          0,
          (Number(values.electric_type) !== 0),
          values.energy_type,
          values.buy_price,
          values.sell_price,
          values.post_code,
          values.transport_lose,
          "Opened",
          values.device_id,
        ];
    const fromAcct = await getFromAcct();
    const transformed = transformParams(paramFields, inputParams);
    // transformed can be empty parameters

    const txExecute = (addEdit === 2) ? (transformed
      ? api.tx.tradeModule.editvpp(...transformed)
      : api.tx.tradeModule.editvpp()) : (transformed
      ? api.tx.tradeModule.createvpp(...transformed)
      : api.tx.tradeModule.createvpp());

    const unsu = await txExecute.signAndSend(fromAcct, txResHandler)
      .catch(txErrHandler);
    setUnsub(() => unsu);
  };

  const transaction = (values) => {
    if (unsub) {
      unsub();
      setUnsub(null);
    }
    signedTx(values)
  };

  const handleSubmit = (values) => {
    setValues({});
    setVisibleModal(false);
    if (!api && !accountPair ) return;

    transaction(values).then(r => console.log(r));
  };

  //  *********** end *********** //

  const handleCancel = () => {
    setValues({});
    setVisibleModal(false);
  };

  const handleOpeationCancel = () => {
    setVisible(false);
  };

  const showBuyModal = (item) => {
    setOperation(1);
    setVisible(true);
  };

  const showSellModal = (item) => {
    setOperation(2);
    setVisible(true);
  };

  // buy && sell
  const handleOpeationSubmit = async (values) => {
    console.log(values);
    setVisible(false);
    if (!api && !accountPair ) return;
    const param = transformParams(
      [true, true, true, true, true, true],
      [
        address,
        0,// 该PS对应VPP编号 临时写成第一个
        values.buy_energy_number ? values.buy_energy_number : 100,// buy_energy_number sell_energy_number
        values.buy_energy_number ? values.buy_energy_number : 100,// buy_energy_token_amount sell_energy_token_amount
        values.type,
        values.pu_ammeter_id,// pu_ammeter_id pg_ammeter_id 消费者电表编号
      ]
    );
    if (unsub) {
      unsub();
      setUnsub(null);
    }
    const fromAcct = await getFromAcct();
    if (operation === 1) {// buy
      await api.tx.tradeModule.buyenergy(...param).signAndSend(fromAcct, txResHandler).catch(txErrHandler);
    } else { // sell
      await api.tx.tradeModule.sellenergy(...param).signAndSend(fromAcct, txResHandler).catch(txErrHandler);
    }
  };

  // close ps
  const closePs = async (status) => {
    if (!api && !accountPair) return;
    const param = transformParams(
      [true, true],
      [
        0,// 该PS对应VPP编号
        status === "开业" ? "Opened" : "Closed" ,
      ]
    );
    if (unsub) {
      unsub();
      setUnsub(null);
    }
    const fromAcct = await getFromAcct();
    const unsu = await api.tx.tradeModule.setvppstatus(...param).signAndSend(fromAcct, txResHandler).catch(txErrHandler);
  };

  const closeClick = (status) => {
    Modal.confirm({
      title: '操作提示',
      content: `是否确定${status}？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {closePs(status)},
    });
  };

  const extraContent = (
    <div className={styles.extraContent}>
      <RadioGroup defaultValue="all">
        <RadioButton value="all">全部</RadioButton>
        <RadioButton value="progress">营业中</RadioButton>
        <RadioButton value="waiting">歇业中</RadioButton>
      </RadioGroup>
      <Search className={styles.extraContentSearch} placeholder="请输入邮编进行搜索" onSearch={() => ({})}/>
      <Button type="primary" onClick={() => {
        setAddEdit(1);
        setVisibleModal(true);
      }}>
        新增电厂
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeaderWrapper>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title=""
            style={{
              marginTop: 24,
            }}
            bodyStyle={{
              padding: '0 32px 40px 32px',
            }}
            extra={extraContent}
          >
            <List
              size="large"
              rowKey="id"
              pagination={paginationProps}
              dataSource={dataSource}
              renderItem={item => (
                <TradeListCell
                  item={item}
                  admin={address && address === item.address}
                  buyClick={() => {
                    showBuyModal(item);
                  }}
                  sellClick={() => {
                    showSellModal(item)
                  }}
                  editClick={() => {
                    setValues(item);
                    setAddEdit(2);
                    setVisibleModal(true);
                  }}
                  closeClick={(status) => {
                    closeClick(status)
                  }}
                />
              )}
            />
          </Card>
        </div>
      </PageHeaderWrapper>

      <OperationModal
        visible={visible}
        operation={operation}
        onCancel={handleOpeationCancel}
        onSubmit={handleOpeationSubmit}
      />
      <AddEditModal
        visible={visibleModal}
        values={values}
        addEdit={addEdit}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
export default TradeList;
