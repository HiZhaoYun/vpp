import React, { useEffect } from 'react';
import {Modal, Form, Select, Input, Button} from 'antd';
import styles from '../style.less';

const { Option } = Select;
const formLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 13,
  },
};

const AddEditModal = props => {
  const [form] = Form.useForm();
  const {visible, values, addEdit, onCancel, onSubmit} = props;

  useEffect(() => {
    if (form && !visible) {
      form.resetFields();
    }
  }, [props.visible]);

  useEffect(() => {
    console.log(values);
    if (JSON.stringify(values).length > 10) {
      form.setFieldsValue({ vpp_name: "南京市发电厂" });
      form.setFieldsValue({ pre_total_stock: values.pre_total_stock });
      form.setFieldsValue({ energy_type: values.energy_type });
      form.setFieldsValue({ electric_type: values.electric_type ? "1" : "0" });
      form.setFieldsValue({ buy_price: values.buy_price });
      form.setFieldsValue({ sell_price: values.sell_price });
      form.setFieldsValue({ post_code: "210000" });
      form.setFieldsValue({ transport_lose: values.transport_lose });
      form.setFieldsValue({ device_id: values.device_id });
    }
  }, [values]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = values => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const onEnergyChange = value => {
    switch (value) {
      case "0":
        form.setFieldsValue({ energy_type: "0" });
        break;
      case "1":
        form.setFieldsValue({ energy_type: "1" });
        break;
      case "2":
        form.setFieldsValue({ energy_type: "2" });
        break;
      default:
        break;
    }
  };

  const onElectricChange = value => {
    switch (value) {
      case "0":
        form.setFieldsValue({ electric_type: "0" });
        break;
      case "1":
        form.setFieldsValue({ electric_type: "1" });
        break;
      default:
        break;
    }
  };

  const modalFooter = {
      okText: '确认',
      onOk: handleSubmit,
      onCancel,
    };

  const getModalContent = () => {
    return (
      <Form {...formLayout} form={form} onFinish={handleFinish}>
        <Form.Item name="vpp_name" label= "虚拟电厂名称" rules={[{ required: true, message: "请输入"}]}>
          <Input placeholder="请输入虚拟电厂名称" />
        </Form.Item>
        <Form.Item name="pre_total_stock" label= "预售总额度" rules={[{ required: true, message: "请输入"}]}>
          <Input placeholder="请输入预售总额度" />
        </Form.Item>
        <Form.Item name="energy_type" label="发电类型" rules={[{ required: true }]}>
          <Select
            placeholder="请选择电类型"
            onChange={onEnergyChange}
            allowClear
          >
            <Option value="0">光电</Option>
            <Option value="1">风电</Option>
            <Option value="2">火电</Option>
          </Select>
        </Form.Item>
        <Form.Item name="electric_type" label="电流类型" rules={[{ required: true }]}>
          <Select
            placeholder="请选择电流类型"
            onChange={onElectricChange}
            allowClear
          >
            <Option value="0">直流</Option>
            <Option value="1">交流</Option>
          </Select>
        </Form.Item>
        <Form.Item name="buy_price" label= "购买价格" rules={[{required: true, message: "请输入"}]}>
          <Input placeholder="请输入购买价格" />
        </Form.Item>
        <Form.Item name="sell_price" label= "出售价格" rules={[{required: true, message: "请输入"}]}>
          <Input placeholder="请输入出售价格" />
        </Form.Item>
        <Form.Item name="post_code" label= "邮编" rules={[{required: true, message: "请输入"}]}>
          <Input placeholder="请输入邮编" />
        </Form.Item>
        <Form.Item name="transport_lose" label= "线损" rules={[{required: true, message: "请输入"}]}>
          <Input placeholder="请输入线损" addonAfter="%"/>
        </Form.Item>
        <Form.Item name="device_id" label= "设备编号" rules={[{required: true, message: "请输入"}]}>
          <Input placeholder="请输入设备编号" addonAfter="测试连通性"/>
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={addEdit === 1 ? '新增电厂' : `编辑电厂`}
      className={styles.standardListForm}
      width={640}
      bodyStyle={
        {
          padding: '28px 0 0',
        }
      }
      destroyOnClose
      visible={visible}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default AddEditModal;
