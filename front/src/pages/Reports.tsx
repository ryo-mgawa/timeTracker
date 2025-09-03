import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

const Reports: React.FC = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h4 className="mb-1">レポート・集計</h4>
              <small className="text-muted">
                工数データの分析と可視化
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">レポート機能</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-4">
                <Alert.Heading className="h6">実装予定の機能</Alert.Heading>
                <ul className="mb-0">
                  <li>プロジェクト別工数集計</li>
                  <li>分類別工数集計</li>
                  <li>ユーザー別工数集計</li>
                  <li>期間指定での絞り込み</li>
                  <li>グラフ・チャート表示</li>
                  <li>CSV/PDF出力機能</li>
                </ul>
              </Alert>
              
              <div className="text-center p-5">
                <h6 className="text-muted">レポート画面</h6>
                <p className="text-muted">
                  工数データの集計・分析機能を実装予定です
                </p>
                <small className="text-muted">
                  データベースビューを活用した高速な集計処理を実現します
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;