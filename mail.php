<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

// config.php 読み込み（Webルート外）
require_once __DIR__ . '/private/config.php';

header('Content-Type: application/json; charset=UTF-8');

// POST以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(403);
  echo json_encode(['status' => 'error', 'message' => 'POSTで送信してください'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Referer 簡易チェック（直叩き対策）
if (
  empty($_SERVER['HTTP_REFERER']) ||
  !str_contains($_SERVER['HTTP_REFERER'], $_SERVER['HTTP_HOST'])
) {
  http_response_code(403);
  exit;
}

// POST データ取得＆サニタイズ
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// ===== フロントと同じバリデーション =====

// 必須チェック
if (!$name || !$email || !$message) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => '必須項目が未入力です'], JSON_UNESCAPED_UNICODE);
  exit;
}

// メール形式チェック
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'メールアドレスが正しくありません'], JSON_UNESCAPED_UNICODE);
  exit;
}

// 日本語チェック（ひらがな・カタカナ・漢字を1文字以上）
if (!preg_match('/[ぁ-んァ-ヶ一-龠]/u', $message)) {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => 'お問い合わせ内容は日本語を1文字以上含めてください'], JSON_UNESCAPED_UNICODE);
  exit;
}

// HTMLエスケープで安全化
$name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$mail = new PHPMailer(true);

try {
  // SMTP設定（Gmail）
  $mail->isSMTP();
  $mail->Host       = SMTP_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = SMTP_USER;
  $mail->Password   = SMTP_PASS;
  $mail->SMTPSecure = SMTP_SECURE;
  $mail->Port       = SMTP_PORT;

  // 文字コード設定（日本語文字化け防止）
  $mail->CharSet  = 'UTF-8';
  $mail->Encoding = 'base64';

  // 送信者・宛先
  $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
  $mail->addAddress(MAIL_TO, MAIL_TO_NAME);

  // メール内容
  if (!empty($subject)) {
      $mail->Subject = MAIL_DEFAULT_SUBJECT . '：' . $subject;
  } else {
      $mail->Subject = MAIL_DEFAULT_SUBJECT;
  }
  $body  = "お名前: $name\n";
  $body .= "メール: $email\n";
  $body .= "件名: $subject\n";
  $body .= "内容:\n$message\n";
  $mail->Body = $body;

  $mail->send();

  http_response_code(200);
  echo json_encode(['status' => 'success']);
} catch (Exception $e) {
  // エラー内容はログにのみ出力
  error_log($mail->ErrorInfo);
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => '送信に失敗しました'], JSON_UNESCAPED_UNICODE);
}
