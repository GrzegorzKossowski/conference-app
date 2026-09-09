import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";

export function TicketReadyEmail({
  eventTitle,
  shortCode,
  ticketUrl,
  qrImageSrc,
}: {
  eventTitle: string;
  shortCode: string;
  ticketUrl: string;
  /** `cid:xxx` for a real send with an inline attachment, or a data URL for previews. */
  qrImageSrc: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Twój bilet na {eventTitle} jest gotowy</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
            textAlign: "center" as const,
          }}
        >
          <Heading style={{ fontSize: "20px" }}>{eventTitle}</Heading>
          <Text>Zapis potwierdzony. Oto Twój bilet — okaż ten kod QR przy wejściu.</Text>
          <Img
            src={qrImageSrc}
            width={240}
            height={240}
            alt="Kod QR biletu"
            style={{ margin: "16px auto" }}
          />
          <Text style={{ fontSize: "14px" }}>
            Twój kod dostępu: <strong>{shortCode}</strong>
          </Text>
          <Text style={{ fontSize: "12px", color: "#6b7280" }}>
            Zapisz ten kod — pozwala ponownie wyświetlić bilet na stronie{" "}
            <Link href={ticketUrl}>{ticketUrl}</Link> bez logowania.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default TicketReadyEmail;
