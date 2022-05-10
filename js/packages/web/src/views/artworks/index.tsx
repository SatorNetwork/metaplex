import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Tabs, Dropdown, Menu } from 'antd';
import { useMeta } from '../../contexts';
import { CardLoader } from '../../components/MyLoader';

import { ArtworkViewState } from './types';
import { useItems } from './hooks/useItems';
import ItemCard from './components/ItemCard';
import { useUserAccounts } from '@oyster/common';
import { DownOutlined } from '@ant-design/icons';
import { isMetadata, isPack } from './utils';
import axios from "axios";

const { TabPane } = Tabs;
const { Content } = Layout;

const serverUrl = 'http://localhost:3500'

async function postNftFiltered({ item
                               }: any) {
  try {
    const url = `${serverUrl}/post-test`;
    const data = {
      item
    };
    console.log(data)
    const res = await axios.post(url, data);
    console.log(res)

  } catch (e: any) {
   console.log(e)
  }
}

export const ArtworksView = () => {
  const { connected } = useWallet();
  const {
    isLoading,
    pullAllMetadata,
    storeIndexer,
    pullItemsPage,
    isFetching,
  } = useMeta();
  const { userAccounts } = useUserAccounts();

  const [activeKey, setActiveKey] = useState(ArtworkViewState.Metaplex);

  const userItems = useItems({ activeKey });

  useEffect(() => {
    if (!isFetching) {
      pullItemsPage(userAccounts);
    }
  }, [isFetching]);

  useEffect(() => {
    if (userItems?.length) {
      postNftFiltered({item:userItems})
    }
  }, [userItems]);

  useEffect(() => {
    if (connected) {
      setActiveKey(ArtworkViewState.Owned);
    } else {
      setActiveKey(ArtworkViewState.Metaplex);
    }
  }, [connected, setActiveKey]);

  const isDataLoading = isLoading || isFetching;

  const artworkGrid = (
    <div className="artwork-grid">
      {isDataLoading &&
        [...Array(10)].map((_, idx) => <CardLoader key={idx} />)}
      {!isDataLoading &&
        userItems.map(item => {
          const pubkey = isMetadata(item)
            ? item.pubkey
            : isPack(item)
            ? item.provingProcessKey
            : item.edition?.pubkey || item.metadata.pubkey;

          return <ItemCard item={item} key={pubkey} />;
        })}
    </div>
  );

  const refreshButton = connected && storeIndexer.length !== 0 && (
    <Dropdown.Button
      className="refresh-button padding0"
      onClick={() => pullItemsPage(userAccounts)}
      icon={<DownOutlined />}
      overlayClassName="refresh-overlay"
      overlay={
        <Menu className="gray-dropdown">
          <Menu.Item onClick={() => pullAllMetadata()}>
            Load All Metadata
          </Menu.Item>
        </Menu>
      }
    >
      Refresh
    </Dropdown.Button>
  );

  return (
    <Layout style={{ margin: 0, marginTop: 30 }}>
      <Content style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Col style={{ width: '100%', marginTop: 10 }}>
          <Row>
            <Tabs
              activeKey={activeKey}
              onTabClick={key => setActiveKey(key as ArtworkViewState)}
              tabBarExtraContent={refreshButton}
            >
              <TabPane
                tab={<span className="tab-title">All</span>}
                key={ArtworkViewState.Metaplex}
              >
                {artworkGrid}
              </TabPane>
              {connected && (
                <TabPane
                  tab={<span className="tab-title">Owned</span>}
                  key={ArtworkViewState.Owned}
                >
                  {artworkGrid}
                </TabPane>
              )}
              {connected && (
                <TabPane
                  tab={<span className="tab-title">Created</span>}
                  key={ArtworkViewState.Created}
                >
                  {artworkGrid}
                </TabPane>
              )}
            </Tabs>
          </Row>
        </Col>
      </Content>
    </Layout>
  );
};
