from fpdf import FPDF, XPos, YPos
from datetime import datetime

class ReceiptPDF(FPDF):
    def __init__(self, data):
        super().__init__()
        self.data = data
        self.amount = data.get("amount", "N/A")
        self.currency = data.get("currency", "XOF")
        self.transaction_id = data.get("homeTransactionId", "N/A")
        self.status = data.get("currentState", "N/A")
        self.note = data.get("note") or "Aucune note"
        self.receiver_name = self._get_receiver_name()
        self.date_payment = self._format_date_fr(data.get("completedTimestamp", data.get("initiatedTimestamp")))

    def _get_receiver_name(self):
        to_data = self.data.get('to', {})
        first = to_data.get('firstName', '')
        middle = to_data.get('middleName', '').strip()
        last = to_data.get('lastName', '')
        return f"{first} {middle} {last}".strip()

    def _format_date_fr(self, iso_str):
        if not iso_str:
            return "N/A"
        try:
            dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
            return dt.strftime("%d %B %Y à %H:%M:%S")
        except ValueError:
            return iso_str

    def header(self):
        self.set_fill_color(30, 65, 135)
        self.rect(0, 0, 210, 35, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 24)
        self.ln(5)
        self.cell(0, 8, "REÇU DE PAIEMENT", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        self.set_font("Helvetica", "", 12)
        self.ln(5)

    def footer(self):
        self.set_y(-25)
        self.set_fill_color(30, 65, 135)
        self.rect(0, 272, 210, 25, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "I", 10)
        self.cell(0, 8, "Merci pour votre confiance !", 0, 1, "C")
        self.cell(0, 8, "Paiement sécurisé via Mojaloop", 0, 1, "C")

    def add_section_title(self, title):
        self.set_fill_color(220, 230, 255)
        self.set_text_color(30, 65, 135)
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True, align="C")
        self.ln(4)

    def add_info_line(self, label, value, label_bold=True):
        self.set_font("Helvetica", "B" if label_bold else "", 12)
        self.set_text_color(80, 80, 80)
        self.cell(60, 8, label)
        self.set_font("Helvetica", "", 12)
        self.set_text_color(0, 0, 0)
        self.cell(0, 8, value, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def add_amount_block(self):
        self.ln(10)
        self.set_fill_color(240, 255, 240)
        self.set_draw_color(34, 139, 34)
        self.set_line_width(2)
        self.rect(35, self.get_y(), 140, 40, 'DF')
        self.set_text_color(34, 139, 34)
        self.set_font("Helvetica", "", 12)
        self.set_xy(40, self.get_y() + 5)
        self.cell(130, 8, "Montant transféré", align="C")
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(22, 101, 52)
        self.ln(8)
        self.cell(130, 12, f"{self.amount} {self.currency}", align="C")
        self.ln(15)

    def generate(self):
        self.add_page()
        self.set_auto_page_break(auto=True, margin=15)
        
        # Statut
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(34, 139, 34)
        self.cell(0, 10, "PAIEMENT RÉUSSI", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        self.ln(5)

        self.add_amount_block()

        self.add_section_title("Détails de la transaction")
        self.add_info_line("Référence transaction :", self.transaction_id)
        self.add_info_line("Statut :", self.status)
        self.add_info_line("Date et heure :", self.date_payment)
        self.ln(4)

        self.add_section_title("Expéditeur")
        self.add_info_line("Nom :", self.data["from"]["name"])
        self.add_info_line("Numéro/ID :", self.data["from"]["idValue"])
        self.ln(4)

        self.add_section_title("Bénéficiaire")
        self.add_info_line("Nom complet :", self.receiver_name)
        self.add_info_line("ID bénéficiaire :", self.data["to"]["idValue"])

        if self.note != "Aucune note":
            self.ln(4)
            self.add_section_title("Note")
            self.add_info_line("Message :", self.note)

        return self.output(dest='S').encode('latin1')  # <-- à remplacer
