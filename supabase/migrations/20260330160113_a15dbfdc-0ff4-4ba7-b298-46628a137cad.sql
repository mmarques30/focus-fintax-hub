CREATE POLICY "Admin gestor pmo delete clientes"
ON public.clientes FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor_tributario'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));