// Assurez-vous d'importer ces libs
import React from 'react';

// Interface pour les données simplifiées du reçu
interface ReceiptData {
    transactionId: string;
    status: string;
    timestamp: string;
    senderName: string;
    receiverId: string;
    amount: string;
    currency: string;
}

const ReceiptTemplate: React.FC<{ data: ReceiptData }> = ({ data }) => {
    // Formatage de la date pour le reçu
    const formattedDate = new Date(data.timestamp).toLocaleString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return (
        <div id="receipt-content" style={{ padding: '30px', border: '1px solid #ccc', maxWidth: '600px', backgroundColor: '#fff' }}>
            <h2 style={{ textAlign: 'center', color: '#1E40AF', borderBottom: '2px solid #3B82F6', paddingBottom: '10px' }}>
                Reçu de Paiement par Lot
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', textAlign: 'center', marginBottom: '20px' }}>
                Transaction réussie. Merci d'utiliser notre service.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', fontWeight: 'bold' }}>Transaction ID:</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', textAlign: 'right' }}>{data.transactionId}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', fontWeight: 'bold' }}>Statut:</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', textAlign: 'right', color: data.status === 'COMPLETED' ? 'green' : 'red' }}>{data.status}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', fontWeight: 'bold' }}>Date:</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', textAlign: 'right' }}>{formattedDate}</td>
                    </tr>
                </tbody>
            </table>

            <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '5px', color: '#4B5563' }}>Détails du Transfert</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb' }}>Expéditeur:</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', textAlign: 'right' }}>{data.senderName}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb' }}>Bénéficiaire ID:</td>
                        <td style={{ padding: '8px 0', borderBottom: '1px dotted #e5e7eb', textAlign: 'right' }}>{data.receiverId}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style={{ textAlign: 'center', marginTop: '30px', backgroundColor: '#F3F4F6', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ margin: 0, color: '#1F2937' }}>Montant Total</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#059669', margin: '5px 0' }}>
                    {data.amount} {data.currency}
                </p>
            </div>
        </div>
    );
};

export default ReceiptTemplate;




import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { renderToStaticMarkup } from 'react-dom/server'; // Nécessaire pour convertir le composant en chaîne HTML

// Assurez-vous que cette fonction est appelée UNIQUEMENT en cas de succès
const generatePDF = (apiResponse: any) => {
    // 1. Extraction et formatage des données
    const receiptData: ReceiptData = {
        transactionId: apiResponse.data.homeTransactionId,
        status: apiResponse.data.currentState,
        timestamp: apiResponse.data.initiatedTimestamp,
        senderName: apiResponse.data.from.name,
        receiverId: apiResponse.data.to.idValue,
        amount: apiResponse.data.amount,
        currency: apiResponse.data.currency,
    };

    // 2. Rendre le composant en HTML (dans le DOM masqué ou en chaîne)
    // Nous allons utiliser une méthode DOM classique pour plus de compatibilité avec html2canvas
    
    // Créez un élément div temporaire dans le DOM
    const tempElement = document.createElement('div');
    // Rendre le composant React en HTML dans cet élément temporaire
    // Cela rend le composant ReceiptTemplate avec les données, dans le DOM, mais hors de l'écran.
    const htmlString = renderToStaticMarkup(<ReceiptTemplate data={receiptData} />);
    tempElement.innerHTML = htmlString;
    document.body.appendChild(tempElement);


    // 3. Conversion en PDF
    html2canvas(tempElement.firstChild as HTMLElement, {
        scale: 2, // Améliore la qualité
        useCORS: true,
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Ajouter l'image de la capture d'écran au PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Gérer les pages multiples si le reçu est très long
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Télécharger le PDF
        const filename = `Reçu_Paiement_${receiptData.transactionId}.pdf`;
        pdf.save(filename);
        
        // Retirer l'élément temporaire du DOM
        document.body.removeChild(tempElement);
    });
};