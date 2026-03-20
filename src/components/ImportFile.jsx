import { useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

function ImportFile() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, setUser } = useAuth();

  const aoSelecionar = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    console.log("Arquivo selecionado:", file);
  };

  const aoEnviar = async () => {
    console.log("aoEnviar chamado");
    console.log("User no contexto:", user);

    if (!selectedFile || !user) {
      console.warn("Nenhum arquivo ou usuário definido");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user.id);

    try {
      // ✅ USANDO API CENTRALIZADA (resolve localhost)
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload concluído:", response.data);

      // 🔄 Atualiza usuário
      const userResponse = await api.get(`/users/${user.id}`);
      const updatedUser = userResponse.data;

      setUser(updatedUser);

      console.log("User atualizado:", updatedUser);

    } catch (err) {
      console.error("Erro no upload:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={aoSelecionar} />
      <button type="button" onClick={aoEnviar}>Enviar</button>
    </div>
  );
}

export default ImportFile;