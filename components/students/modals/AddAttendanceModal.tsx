
import React, { useState } from 'react';
import Modal from '../../common/Modal';
import { Attendance } from '../../../types';

interface AddAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (attendanceData: Attendance) => void;
}

const AddAttendanceModal: React.FC<AddAttendanceModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<'Presente' | 'Ausente' | 'Justificado'>('Presente');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!date) {
            setError('A data é obrigatória.');
            return;
        }

        onAdd({ date, status });
        handleClose();
    };

    const handleClose = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setStatus('Presente');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Registro de Frequência">
            <div className="space-y-4">
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="Presente">Presente</option>
                        <option value="Ausente">Ausente</option>
                        <option value="Justificado">Justificado</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-sky-600">Adicionar Registro</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddAttendanceModal;
